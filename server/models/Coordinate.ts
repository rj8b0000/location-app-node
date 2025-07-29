import mongoose, { Document, Schema } from 'mongoose';

export interface ICoordinate extends Document {
  name: string;
  description?: string;
  polygon: {
    type: 'Polygon';
    coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const coordinateSchema = new Schema<ICoordinate>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  polygon: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

coordinateSchema.index({ polygon: '2dsphere' });

export const Coordinate = mongoose.model<ICoordinate>('Coordinate', coordinateSchema);
