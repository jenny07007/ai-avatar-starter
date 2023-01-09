const bufferToBase64 = (buffer) => {
  const base64 = buffer.toString("base64");
  return `data:image/png;base64,${base64}`;
};

const generateAction = async (req, res) => {
  console.log("Received request");

  const input = JSON.parse(req.body).input;
  const finalInput = input.replace(/jen/gi, "jjeenn");

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/jenny07/sd-1-5-jjeenn`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_AUTH_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: finalInput,
        }),
      },
    );

    if (response.ok) {
      const buffer = await response.buffer();
      const base64 = bufferToBase64(buffer);
      return res.status(200).json({ image: base64 });
    }
    if (response.status === 503) {
      const json = await response.json();
      return res.status(503).json(json);
    }
  } catch (error) {
    return res.status(response.status).json({ error: response.statusText });
  }
};

export default generateAction;
