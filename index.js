    import express from "express";
    import { MongoClient, ObjectId } from "mongodb";
    import cors from "cors";
    import bcrypt from "bcrypt"
    import jwt  from "jsonwebtoken";
    const app = express();
    const url =
    "mongodb+srv://Sricharan:Sricharan7113@cluster0.9oasnpf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

    const client = new MongoClient(url);
    await client.connect();
    console.log("database connected successfully");

    app.use(express.json());
    app.use(cors({
        origin:"*" //this backend deployed URL can be accessed with any deployed URL 
        //replace '*' with your frontend URL o that it could be accessed only by you.
    }));

    const Auth = ((req, res , next)=>{
        try{
            const token = req.header("backend-token");
            jwt.verify(token,"Sricharan");
            next();
        }
        catch(error){
            res.status(401).send({message:error.message})
        }
    })

    app.get("/", (req, res) => {
        
        
    res.status(200).send("hello world!");
    });


    app.post("/post", async (req, res) => {
    const getpostman = req.body;
    // console.log(getpostman);
    const sendmethod = await client
        .db("CRUD")
        .collection("data")
        .insertOne(getpostman);
    res.status(201).send(sendmethod);
    });

    app.post("/postmany", async (req, res) => {
    const getmany = req.body;
    const sendmethod = await client
        .db("CRUD")
        .collection("data")
        .insertMany(getmany);
    res.status(201).send(sendmethod);
    });
    app.get("/get",Auth, async (req, res) => {
    const getmethod = await client
        .db("CRUD")
        .collection("data")
        .find({})
        .toArray();        
        
    res.status(200).send(getmethod);
    });

    app.get("/getone/:id", async (req, res) => {
    const { id } = req.params;
    //console.log(id);
    const getmethod = await client
        .db("CRUD")
        .collection("data")
        .findOne({ _id: new ObjectId(id) });
    res.status(200).send(getmethod);
    });

    app.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    console.log(id);
    const getpostman = req.body;
    console.log(getpostman);

    const updatemethod = await client
        .db("CRUD")
        .collection("data")
        .updateOne({ _id: new ObjectId(id) }, { $set: getpostman });
    res.status(201).send(updatemethod);
    });

    app.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    const deletemethod = await client
        .db("CRUD")
        .collection("data")
        .deleteOne({ _id: new ObjectId(id) });
    res.status(200).send(deletemethod);
    });

    app.post("/register", async function (req, res){

        const{username , email , password} = req.body;
  

    const UserFind = await client
        .db("CRUD")
        .collection("private").findOne({email:email});
   

    if (UserFind) {
        res.status(400).send("User Already Exist");
    } else {
        const salt =await bcrypt.genSalt(10);
        const HashedPassword = await bcrypt.hash(password,salt);
        
        const registerMethod = await client
        .db("CRUD")
        .collection("private")
        .insertOne({username:username , email:email , password:HashedPassword});
        res.status(201).send(registerMethod);
    }
    });

    app.post("/login" ,async(req ,res)=>{
        const {email ,password} = req.body;

        const UserFind = await client.db("CRUD").collection("private").findOne({email:email})

        if(UserFind){
            const mongoDBpassword =UserFind.password;
            const passwordCheck =await bcrypt.compare(password,mongoDBpassword);

            console.log(passwordCheck);

            if(passwordCheck)
            {
                const token = jwt.sign({_id:UserFind._id},"Sricharan");
                res.status(200).send({token:token});
            }

            else
            {
                res.status(400).send({message:"Invalid Password"})
            }
        }else{
            res.status(400).send({message:"Invalid email"})
        }

    } )

    app.listen(5000, () => {
    console.log("server connection succesfully");
    });
