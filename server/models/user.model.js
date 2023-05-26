import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Please Provide a Valid Email"],
    },
    photo: {
      type: String,
      default:
        "https://res.cloudinary.com/dljzenvs4/image/upload/v1683693369/gh-fitness/i3memijbquqil4id48no.jpg",
    },
    password: {
      type: String,
      min: 8,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: "user",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    resetTokenExpiresAt: Date,
    favourites: [],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//

// UserSchema.pre(/^patch/, function (next) {
//   this.populate({
//     path: "favourites",
//   });
// });

//pre save middleware for encrypting password;
UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();

  this.password = bcrypt.hashSync(this.password, 14);
  next();
});

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

//method for checking password
UserSchema.methods.isCorrect = async function (currentPassword, password) {
  return await bcrypt.compare(currentPassword, password);
};

//is password changed method
UserSchema.methods.isPasswordChanged = function (timestamp) {
  if (this.passwordChangedAt) {
    const changeTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return timestamp < changeTimestamp;
  }
  return false;
};

//create reseturl token method
UserSchema.methods.createResetToken = function () {
  const string = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(string)
    .digest("hex");

  this.resetTokenExpiresAt = Date.now() + 10 * 60 * 1000;

  return string;
};
const User = mongoose.model("User", UserSchema);

export default User;
