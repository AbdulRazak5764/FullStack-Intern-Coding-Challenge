import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';

const router = Router();

router.get('/admin', authenticate, authorize(['SYSTEM_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

router.get('/owner', authenticate, authorize(['STORE_OWNER']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (stores.length === 0) {
      return res.json({ stores: [] });
    }

    const dashboardStores = stores.map((store: any) => {
      let averageRating = 0;
      if (store.ratings.length > 0) {
        averageRating = store.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / store.ratings.length;
      }
      return {
        id: store.id,
        name: store.name,
        address: store.address,
        averageRating,
        totalRatings: store.ratings.length,
        raters: store.ratings.map((r: any) => ({
          userId: r.user.id,
          name: r.user.name,
          email: r.user.email,
          rating: r.rating,
          submittedAt: r.updatedAt
        }))
      };
    });

    return res.json({ stores: dashboardStores });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
});

export default router;
