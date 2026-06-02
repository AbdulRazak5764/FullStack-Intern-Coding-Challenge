import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { CreateStoreSchema } from '../validators';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';

const router = Router();

// Get all stores (accessible to all logged-in users)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, sortBy, sortOrder } = req.query;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    if (sortBy && typeof sortBy === 'string') {
      // Custom sorting for rating will be done in-memory
      if (sortBy !== 'rating') {
        orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
      }
    } else {
      orderBy.name = 'asc';
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : undefined,
      include: {
        ratings: true,
      }
    });

    const mappedStores = stores.map((store: any) => {
      let averageRating = 0;
      if (store.ratings.length > 0) {
        averageRating = store.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / store.ratings.length;
      }
      
      // Check if current user has rated
      const userRatingObj = store.ratings.find((r: any) => r.userId === req.user?.id);
      const userRating = userRatingObj ? userRatingObj.rating : null;
      const userRatingId = userRatingObj ? userRatingObj.id : null;

      // Omit all ratings array in response to save bandwidth
      const { ratings, ...rest } = store;
      return {
        ...rest,
        averageRating,
        userRating,
        userRatingId,
        totalRatings: ratings.length
      };
    });

    // Handle in-memory sorting by rating
    if (sortBy === 'rating') {
      mappedStores.sort((a: any, b: any) => {
        if (sortOrder === 'desc') return b.averageRating - a.averageRating;
        return a.averageRating - b.averageRating;
      });
    }

    return res.json(mappedStores);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

// Add new store (Admin Only)
router.post('/', authenticate, authorize(['SYSTEM_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateStoreSchema.parse(req.body);

    const store = await prisma.store.create({
      data: {
        name: data.name,
        email: data.email,
        address: data.address,
        ownerId: data.ownerId,
      },
    });

    // Ensure the owner's role is set to STORE_OWNER
    await prisma.user.update({
      where: { id: data.ownerId },
      data: { role: 'STORE_OWNER' }
    });

    return res.status(201).json(store);
  } catch (error: any) {
    return res.status(400).json({ message: error.errors || error.message });
  }
});

export default router;
