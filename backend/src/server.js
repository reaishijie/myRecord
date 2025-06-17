import app from './app.js'
import dotenv from 'dotenv'
dotenv.config('../.env')

const port = process.env.PORT

app.listen(port, () => {
    console.log(new Date().toLocaleString(),`Server is running on http://localhost:${port}`)
})
