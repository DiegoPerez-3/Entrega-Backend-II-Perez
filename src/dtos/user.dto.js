// DTO (Data Transfer Object) para normalizar y filtrar los datos de usuario hacia el cliente.
// Evita exponer campos sensibles como password, hash o datos internos innecesarios en la respuesta de /current.
const toCurrent = (user) => {
  if (!user) return null;
  return {
    id: user._id || user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    age: user.age,
    role: user.role,
    cart: user.cart?._id || user.cart,
  };
};

export const userDto = {
  toCurrent,
};
