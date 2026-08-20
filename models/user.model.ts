import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Modelo Mongoose del usuario Admin (login único del sitio).
 * Recibe: username/password en texto plano al crear/actualizar.
 * Procesa: hashea el password con bcrypt en el hook `pre('save')` si cambió.
 * Produce: `User`, con `comparePassword()` para validar login contra el hash guardado.
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModel extends Model<IUser> {}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Hash de contraseña
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Método para comparar contraseña
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User as UserModel || mongoose.model<IUser, UserModel>('User', UserSchema);