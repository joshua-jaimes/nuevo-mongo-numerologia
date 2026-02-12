import Usuario from "../models/usuario.js"

const getUsuario= async (req,res)=>{
    try {
        const usuarios= await Usuario.find()
        res.json({usuarios})
    } catch (error) {
        res.status(400).json({error})
    }
}

const getUsuarioEmail= async (req,res)=>{
    try {
        const {email}=req.query
        const usuarios= await Usuario.find({email})
        res.json({usuarios})
    } catch (error) {
        res.status(400).json({error})
    }
}

const postUsuario=async(req,res)=>{
    try {
         const {nombre,edad,fechanacimiento,email}=req.body

        const usuario= new Usuario({
            nombre,
            edad,
            fechanacimiento,
            email,
            estado: 0 
        })

        await usuario.save()

         res.json({usuario,msg:"Usuario creado correctamente"})

    } catch (error) {
         res.status(400).json({error})
    }
}


const putUsuario=async(req,res)=>{
    try {
        const {nombre}=req.body
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{nombre})

        res.json({msg:"Usuario modificado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const putUsuarioActivar=async(req,res)=>{
    try {
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{estado:1})

        res.json({msg:"Usuario activado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const putUsuarioInactivar=async(req,res)=>{
    try {
        const {id}=req.params

        await Usuario.findByIdAndUpdate(id,{estado:0})

        res.json({msg:"Usuario inactivado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

const deleteUsuario=async(req,res)=>{
    try {
        const {id}=req.params

        await Usuario.findByIdAndDelete(id)

        res.json({msg:"Usuario eliminado correctamente"})
    } catch (error) {
          res.status(400).json({error})
    }
    

}

export {getUsuario,postUsuario,putUsuario,putUsuarioActivar,putUsuarioInactivar,deleteUsuario, getUsuarioEmail}