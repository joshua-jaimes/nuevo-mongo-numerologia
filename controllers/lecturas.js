

import Lectura from "../models/lecturas.js"
import Usuario from "../models/usuario.js"
import Pago from "../models/pagos.js"

const getLecturas = async (req, res) => {
  try {
    const lecturas = await Lectura.find()
    res.json({ lecturas })
  } catch (error) {
    res.status(400).json({ error })
  }
}
const getLecturasId = async (req, res) => {
  try {
    const { usuario_id } = req.params
    const lecturas = await Lectura.find({ usuario_id })
    res.json({ lecturas })
  } catch (error) {
    res.status(400).json({ error })
  }
}




const postLecturas = async (req, res) => {
  try {
    console.log("\n================ NUEVA PETICIÓN =================");
    console.log("👉 BODY:", req.body);

    const { usuario_id, tipo } = req.body;

   
    const usuario = await Usuario.findById(usuario_id);
    if (!usuario) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }


    
if (usuario.estado === 0) {
  return res.status(403).json({
    msg: "Tu cuenta está inactiva. Contacta con soporte."
  });
}



    
    if (tipo === "principal") {
      const lecturaExistente = await Lectura.findOne({
        usuario_id,
        tipo: "principal",
      });
      if (lecturaExistente) {
        return res.status(400).json({
          msg: "Ya has generado tu lectura principal. Esta lectura es única de por vida.",
        });
      }
    }  else if (tipo === "diaria") {

  
  if (usuario.estado !== 1) {
    return res.status(403).json({
      msg: "Solo los usuarios activos pueden generar lecturas diarias"
    });
  }

  
  const pagoActivo = await Pago.findOne({
    usuario_id,
    fecha_vencimiento: { $gte: new Date() },
  });

  if (!pagoActivo) {
    return res.status(403).json({
      msg: "Tu membresía ha vencido. Debes renovar el pago para acceder a lecturas diarias",
    });
  }


const hoyInicio = new Date();
hoyInicio.setUTCHours(5, 0, 0, 0);

const hoyFin = new Date();
hoyFin.setUTCHours(28, 59, 59, 999);


  const lecturaHoy = await Lectura.findOne({
  usuario_id,
  tipo: "diaria",
  $expr: {
    $eq: [
      {
        $dateTrunc: {
          date: "$createdAt",
          unit: "day",
          timezone: "America/Bogota"
        }
      },
      {
        $dateTrunc: {
          date: new Date(),
          unit: "day",
          timezone: "America/Bogota"
        }
      }
    ]
  }
});


  if (lecturaHoy) {
    return res.status(400).json({
      msg: "Ya generaste tu lectura diaria de hoy"
    });
  }
}


    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ msg: "API Key no configurada" });
    }


const diaHoy = new Date().toLocaleDateString("en-CA", {
  timeZone: "America/Bogota"
});




    const hoy = new Date().toLocaleDateString("es-CO", {
  timeZone: "America/Bogota",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const prompt =
  tipo === "principal"
    ? `
Eres un numerólogo profesional, claro, respetuoso y motivador.

Genera una lectura numerológica PRINCIPAL completa para una persona nacida el ${usuario.fechanacimiento}.

Incluye obligatoriamente las siguientes secciones:

1. Número de vida y su significado.
2. Misión de vida.
3. Talentos naturales.
4. Retos importantes.
5. Propósito personal y espiritual.
6. Consejo general para su camino de vida.

Reglas:
- No inventes fechas.
- No muestres cálculos matemáticos.
- No menciones astrología.
- No hagas referencias a años pasados o futuros.

Redacta en español claro, con buena estructura y tono positivo.
`
    : `
Eres un numerólogo profesional y motivador.

Genera una lectura numerológica DIARIA, clara, breve e inspiradora.

Fecha obligatoria: HOY es ${hoy}.
No utilices ninguna otra fecha.

Datos del usuario:
Fecha de nacimiento: ${usuario.fechanacimiento}.

Incluye:
1. Número del día y su significado.
2. Energía general del día.
3. Consejo práctico para hoy.

Reglas:
- No inventes fechas.
- No muestres cálculos matemáticos.
- No hagas referencias a años pasados o futuros.
- Mantén un tono cercano y positivo.

Inicia el texto mencionando claramente la fecha de hoy: ${hoy}.
`;


    console.log("📝 Enviando petición a Gemini (Axios v1beta)...");

    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

   
    const axios = (await import("axios")).default;

   
    const makeRequest = async (retries = 3, delay = 1000) => {
      try {
        return await axios.post(
          url,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 20000,
          }
        );
      } catch (err) {
        if (retries > 0 && err.response && err.response.status === 429) {
          console.log(`⚠️ Rate limit hit (429). Retrying in ${delay}ms...`);
          await new Promise(res => setTimeout(res, delay));
          return makeRequest(retries - 1, delay * 2);
        }
        throw err;
      }
    };

    const response = await makeRequest();

    const contenido =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log("👉 Contenido generado:", contenido ? "Sí" : "No");

    if (!contenido) {
      throw new Error("Respuesta vacía de Gemini");
    }

    if (tipo === "diaria") {
  const existente = await Lectura.findOne({
    usuario_id,
    tipo: "diaria",
    dia: diaHoy
  });

  if (existente) {
    return res.status(400).json({
      msg: "Ya generaste tu lectura diaria de hoy"
    });
  }

  const lectura = new Lectura({
    usuario_id,
    tipo: "diaria",
    contenido,
    dia: diaHoy
  });

  await lectura.save();
} else {
  const lectura = new Lectura({
    usuario_id,
    tipo,
    contenido
  });

  await lectura.save();
}

    console.log("✅ Lectura guardada en BD");

    res.json({
      msg: "Lectura creada correctamente",
      lectura,
    });
  } catch (error) {
    const apiError = error.response?.data?.error;
    console.error("❌ Gemini Error:", apiError ? JSON.stringify(apiError) : error.message);

    res.status(500).json({
      error: error.message,
      details: apiError || error.toString()
    });
  }
};





const putLecturas = async (req, res) => {
  try {
    const { id } = req.params
    const { tipo, contenido } = req.body
    await Lectura.findByIdAndUpdate(id, { tipo, contenido })
    res.json({ msg: "Lectura modificada correctamente" })
  } catch (error) {
    res.status(400).json({ error })
  }
}
const deleteLecturas = async (req, res) => {
  try {
    const { id } = req.params
    await Lectura.findByIdAndDelete(id)
    res.json({ msg: "Lectura eliminada correctamente" })
  } catch (error) {
    res.status(400).json({ error })
  }
}
export { getLecturas, postLecturas, putLecturas, deleteLecturas, getLecturasId }