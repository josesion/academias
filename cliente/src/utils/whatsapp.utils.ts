export const generarLinkWhatsApp = (numero: string, mensaje: string): string => {
  const numeroLimpio = numero.replace(/[^0-9]/g, '');
  const mensajeCodificado = encodeURIComponent(mensaje);
  return `https://wa.me/${numeroLimpio}?text=${mensajeCodificado}`;
};

export const linkWhatsAppPlanes = (numero: string, planNombre: string, planPrecio: string): string => {
  const mensaje = `Hola! Interesado en el plan ${planNombre} por ${planPrecio}. ¿Más información?`;
  return generarLinkWhatsApp(numero, mensaje);
};