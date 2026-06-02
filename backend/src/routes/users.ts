import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { RegisterSchema } from '../validators';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';

const router = Router();

// Only Admin can access these routes
router.use(authenticate, authorize(['SYSTEM_ADMIN']));

// Add new user
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        password: hashedPassword,
        role: data.role || 'NORMAL_USER',
      },
    });

    return res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error: any) {
    return res.status(400).json({ message: error.errors || error.message });
  }
});

// List users with filters and sorting
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, sortBy, sortOrder } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { email: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = String(role);
    }

    const orderBy: any = {};
    if (sortBy && typeof sortBy === 'string') {
      orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        // Include rating if Store Owner (this will be calculated separately since it's on the Store model)
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true }
            }
          }
        }
      },
    });

    // Map to include calculated rating for Store Owners
    const mappedUsers = users.map((u: any) => {
      let storeRating = null;
      if (u.role === 'STORE_OWNER' && u.stores.length > 0) {
        const allRatings = u.stores.flatMap((s: any) => s.ratings);
        if (allRatings.length > 0) {
          storeRating = allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length;
        }
      }
      const { stores, ...rest } = u;
      return { ...rest, storeRating };
    });

    return res.json(mappedUsers);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// View Details of a specific user
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user: any = await prisma.user.findUnique({
      where: { id: String(req.params.id) },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        stores: {
          select: {
            ratings: { select: { rating: true } }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    let storeRating = null;
    if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
      const allRatings = user.stores.flatMap((s: any) => s.ratings);
      if (allRatings.length > 0) {
        storeRating = allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length;
      }
    }

    const { stores, ...rest } = user;
    return res.json({ ...rest, storeRating });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

export default router;
