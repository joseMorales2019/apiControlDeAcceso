export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error capturado por middleware global:');
  console.error(err.stack); // Imprime el stack completo

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
