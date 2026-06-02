import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { SubmitRatingSchema } from '../validators';
import { authenticate, authorize, AuthRequest } from '../middlewares/auth';

const router = Router();

// Submit or Modify a rating
router.post('/', authenticate, authorize(['NORMAL_USER']), async (req: AuthRequest, res: Response) => {
  try {
    const data = SubmitRatingSchema.parse(req.body);
    const userId = req.user!.id;

    const existingRating = await prisma.rating.findUnique({
      where: {
        userId_storeId: { userId, storeId: data.storeId }
      }
    });

    if (existingRating) {
      // Modify rating
      const updated = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { rating: data.rating }
      });
      return res.json(updated);
    } else {
      // Create rating
      const rating = await prisma.rating.create({
        data: {
          rating: data.rating,
          storeId: data.storeId,
          userId,
        }
      });
      return res.status(201).json(rating);
    }
  } catch (error: any) {
    return res.status(400).json({ message: error.errors || error.message });
  }
});

export default router;
