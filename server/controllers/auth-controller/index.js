const asyncHandler = require("express-async-handler");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { userName, userEmail, password, role,regd,branch } = req.body;

  const { success, message } = await registerUserUtility({
    userName,
    userEmail,
    password,
    role,
    regd,
    branch,
  });

  if (!success) {
    return res.status(400).json({ success, message });
  }

  return res.status(201).json({ success, message });
};


const registerUserUtility = async ({userName,userEmail,password,role,regd,branch}) => {
  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return { success: false, message: "User name or user email already exists" };
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    userName: userName.trim(),
    userEmail: userEmail.trim(),
    role: role.trim(),
    regd: regd.trim(),
    branch: branch.trim(),
    password: hashPassword,
  });

  await newUser.save();

  return { success: true, message: "User registered successfully!" };
}

const bulkRegisterUsers = asyncHandler(async (req, res) => {
  const { format,data } = req.body;

  try {
      let parsedData = [];

      if (format === 'csv') {
          const readableStream = Readable.from(data);
          readableStream
              .pipe(csv())
              .on('data', (row) => parsedData.push(row))
              .on('end', async () => {
                  const { success, message } = await processBulkData(parsedData);
                  if (!success) {
                      return res.status(400).json({ success, message });
                  } 
                  return res.status(201).json({ success, message });
              });
      } else if (format === 'json') {
          if (typeof data === 'string') {
              parsedData = JSON.parse(data);
          }
          else {
              parsedData = data;
          }
          const { success, message } = await processBulkData(parsedData);
          if (!success) {
              return res.status(400).json({ success, message });
          } 
          return res.status(201).json({ success, message });
      } else if (format === 'excel') {
          const workbook = XLSX.read(data, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(sheet);
          const { success, message } = await processBulkData(parsedData);
          if (!success) {
              return res.status(400).json({ success, message });
          }   
          return res.status(201).json({ success, message });
      } else {
          return res.status(400).json({ success : false, message: 'Unsupported format' });
      }
  } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success : false, message: error.message });
  }

  async function processBulkData(users) {
      try {
          for (const userData of users) {
              await registerUserUtility({userName : userData.email, userEmail : userData.email, password : userData.password, role : userData.role, regd : userData.regd, branch : userData.branch});
          }
          return { success : true, message: 'Bulk registration successful' };
      }
      catch (error){
          console.log("While bulk: "+error.message);
          return {success : false, message: error.message };
      }

  }
});

const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  const checkUser = await User.findOne({ userEmail });

  if (!checkUser || !(await bcrypt.compare(password, checkUser.password))) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    "JWT_SECRET",
    { expiresIn: "120m" }
  );

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};

module.exports = { registerUser, bulkRegisterUsers, loginUser };
