import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
const PORT = process.env.PORT || 5000;
//Mongoose schema
const accountSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
});
const Account = mongoose.model("Account", accountSchema);
app.get("/", (req, res) => {
  res.send("Hello to the server");
});
app.post("/auth/singup", async (req, res) => {
  const user = req.body;
  try {
    const existingAccount = await Account.findOne({ email: user?.email });
    if (existingAccount) {
      return res.status(400).json({ message: "Account already exists" });
    }
    if (existingAccount?.password !== existingAccount?.confirmPassword) {
      return res.status(400).json({ message: "Passwords don't match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await Account.create({
      email,
      password: hashedPassword,
      name: `${existingAccount.firstName} ${existingAccount.lastName}`,
    });
    const token = jwt.sign({ email: result.email, id: result._id }, "test", {
      expiresIn: "1h",
    });
    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
app.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingAccount = await Account.findOne({ email });
    if (!existingAccount) {
      return res.status(400).json({ message: "Account doen't exists" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAccount.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Incorect credentials" });
    }
    const token = jwt.sign({ email, id: existingAccount._id }, "test", {
      expiresIn: "1h",
    });
    res.status(200).json({ result: existingAccount, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log("Server running on port " + PORT))
  )
  .catch((error) => console.log(error.message));
