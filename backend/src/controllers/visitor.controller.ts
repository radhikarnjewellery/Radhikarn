import { Request, Response } from 'express';
import { Visitor } from '../models/Visitor';

const WINDOW_MS = 45 * 60 * 1000; // 45 minutes

async function geoFromIp(ip: string): Promise<{ city?: string; region?: string; country?: string }> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('::1')) {
    return {};
  }
  try {
    // ip-api.com: free, no key — returns zip/postal code too
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=city,regionName,country,zip,status`);
    const data = await res.json();
    if (data.status === 'success') {
      // If we have a zip/pincode, use India Post API to get accurate city/state
      if (data.zip && /^\d{6}$/.test(data.zip)) {
        try {
          const pinRes = await fetch(`https://api.postalpincode.in/pincode/${data.zip}`);
          const pinData = await pinRes.json();
          if (pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length > 0) {
            const po = pinData[0].PostOffice[0];
            return { city: po.District || po.Name, region: po.State, country: data.country };
          }
        } catch {}
      }
      return { city: data.city, region: data.regionName, country: data.country };
    }
  } catch {}
  return {};
}

async function geoFromCoords(lat: number, lng: number): Promise<{ city?: string; region?: string }> {
  try {
    // Nominatim reverse geocode — free, no key
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { 'User-Agent': 'RadhikarnAdmin/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const pincode = addr.postcode;
    // Try pincode-based lookup for accuracy
    if (pincode && /^\d{6}$/.test(pincode)) {
      try {
        const pinRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const pinData = await pinRes.json();
        if (pinData[0]?.Status === 'Success' && pinData[0]?.PostOffice?.length > 0) {
          const po = pinData[0].PostOffice[0];
          return { city: po.District || po.Name, region: po.State };
        }
      } catch {}
    }
    return {
      city: addr.city || addr.town || addr.village || addr.county || '',
      region: addr.state || '',
    };
  } catch {}
  return {};
}

export const recordVisit = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userEmail, userName, lat, lng } = req.body;

    // Real IP — handle proxies and IPv6-mapped IPv4
    const rawIp = (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown'
    );
    const ip = rawIp.replace('::ffff:', '').trim();

    const userAgent = req.headers['user-agent'] || '';
    const windowStart = new Date(Date.now() - WINDOW_MS);
    const normalizedEmail = userEmail?.toLowerCase().trim();

    // Dedup: within 45-min window, match by email (logged in) OR by IP (anonymous)
    let existing = null;
    if (normalizedEmail) {
      existing = await Visitor.findOne({
        userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
        lastSeen: { $gte: windowStart }
      });
    }
    if (!existing) {
      existing = await Visitor.findOne({
        ip,
        userEmail: normalizedEmail
          ? { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
          : { $exists: false },
        lastSeen: { $gte: windowStart }
      });
    }

    if (existing) {
      existing.lastSeen = new Date();
      existing.visitCount += 1;
      if (normalizedEmail && !existing.userEmail) existing.userEmail = normalizedEmail;
      if (userName && !existing.userName) existing.userName = userName;
      await existing.save();
      res.json({ recorded: false, updated: true });
      return;
    }

    // Resolve location
    let city: string | undefined, region: string | undefined, country: string | undefined;
    if (lat && lng) {
      const geo = await geoFromCoords(lat, lng);
      city = geo.city;
      region = geo.region;
    }
    if (!city) {
      const geo = await geoFromIp(ip);
      city = geo.city;
      region = geo.region;
      country = geo.country;
    }

    await Visitor.create({
      ip,
      userEmail: normalizedEmail || undefined,
      userName: userName || undefined,
      city: city || undefined,
      region: region || undefined,
      country: country || undefined,
      lat: lat || undefined,
      lng: lng || undefined,
      userAgent,
      lastSeen: new Date(),
      visitCount: 1,
      seen: false,
    });

    res.json({ recorded: true });
  } catch (err) {
    console.error('Visitor record error:', err);
    res.status(500).json({ message: 'Error recording visit' });
  }
};

export const getVisitors = async (req: Request, res: Response): Promise<void> => {
  try {
    const visitors = await Visitor.find().sort({ lastSeen: -1 }).limit(500);
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching visitors' });
  }
};

export const getUnseenCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Visitor.countDocuments({ seen: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unseen count' });
  }
};

export const markAllSeen = async (req: Request, res: Response): Promise<void> => {
  try {
    await Visitor.updateMany({ seen: false }, { $set: { seen: true } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error marking seen' });
  }
};

export const deleteVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting visitor' });
  }
};

export const deleteManyVisitors = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'No IDs provided' }); return;
    }
    await Visitor.deleteMany({ _id: { $in: ids } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting visitors' });
  }
};
