import express from "express"
import multer from "multer"
import fetch from "node-fetch"
import cors from "cors"
import FormData from "form-data"
import { Buffer } from "buffer"

const app = express()
const upload = multer()

app.use(cors())

app.post("/remove-bg", upload.single("image"), async (req, res) => {

try{

const formData = new FormData()
formData.append("image_file", req.file.buffer, "photo.png")
formData.append("size", "auto")

const response = await fetch(
"https://api.remove.bg/v1.0/removebg",
{
method:"POST",
headers:{
"X-Api-Key":"e995TTVanpfqgQ4P7qgYoMaJ"
},
body:formData
}
)

const buffer = await response.arrayBuffer()

res.set("Content-Type","image/png")
res.send(Buffer.from(buffer))

}catch(err){
console.error(err)
res.status(500).send("Background removal failed")
}

})

app.listen(5000,()=>{
console.log("Server running on http://localhost:5000")
})