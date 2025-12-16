const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('');  
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const prompt = 'Genera una planificación básica para matemáticas en 6to grado en El Salvador.';
async function run() {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Respuesta de Gemini:', text);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
run();