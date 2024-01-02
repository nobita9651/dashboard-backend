const imageSchema = new mongoose.Schema(
  {
    data: Buffer,
    contentType: String,
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
