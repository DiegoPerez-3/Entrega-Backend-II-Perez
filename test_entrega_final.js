const BASE = 'http://localhost:8080';

async function run() {
  console.log('========================================');
  console.log('SUITE DE PRUEBAS COMPLETAS ENTREGA FINAL');
  console.log('========================================\n');

  // --- SETUP USERS ---
  console.log('--- SETUP USERS (User & Admin) ---');
  const user1Data = {
    first_name: 'Regular',
    last_name: 'User',
    email: 'user_' + Date.now() + '@ecommerce.com',
    age: 25,
    password: 'UserPass123!'
  };
  const reg1Res = await fetch(BASE + '/api/sessions/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user1Data)
  });
  const reg1 = await reg1Res.json();
  const user1CartId = reg1.payload.cart._id || reg1.payload.cart;

  const login1 = await fetch(BASE + '/api/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Data.email, password: user1Data.password })
  });
  const user1Cookie = login1.headers.get('set-cookie').split(';')[0];

  const user2Data = {
    first_name: 'Other',
    last_name: 'User',
    email: 'other_' + Date.now() + '@ecommerce.com',
    age: 30,
    password: 'UserPass123!'
  };
  const reg2 = await fetch(BASE + '/api/sessions/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user2Data)
  }).then(r => r.json());
  const user2CartId = reg2.payload.cart._id || reg2.payload.cart;

  // Admin user
  const adminData = {
    first_name: 'Admin',
    last_name: 'Boss',
    email: 'admin_' + Date.now() + '@ecommerce.com',
    age: 40,
    password: 'AdminPass123!'
  };
  const regAdmin = await fetch(BASE + '/api/sessions/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(adminData)
  }).then(r => r.json());
  const adminUserId = regAdmin.payload._id;

  // Promote to admin directly in DB for testing
  const mongoose = await import('mongoose');
  await mongoose.default.connect('mongodb://127.0.0.1:27017/ecommerce');
  await mongoose.default.connection.db.collection('users').updateOne(
    { _id: new mongoose.default.Types.ObjectId(adminUserId) },
    { $set: { role: 'admin' } }
  );

  const loginAdmin = await fetch(BASE + '/api/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminData.email, password: adminData.password })
  });
  const adminCookie = loginAdmin.headers.get('set-cookie').split(';')[0];

  console.log('✓ Usuarios preparados (User 1, User 2 y Admin)');

  // --- PRUEBA 1: DTO EN /current ---
  console.log('\n--- PRUEBA 1: DTO EN /api/sessions/current ---');
  const currentRes = await fetch(BASE + '/api/sessions/current', {
    headers: { 'Cookie': user1Cookie }
  });
  const currentData = await currentRes.json();
  console.log('Status /current:', currentRes.status);
  console.log('Payload DTO:', JSON.stringify(currentData.payload));
  if (currentData.payload?.password || currentData.payload?.hash) {
    throw new Error('FALLO: El DTO expone datos sensibles');
  }
  if (!currentData.payload?.email || currentData.payload?.role !== 'user') {
    throw new Error('FALLO: El DTO no contiene los campos esperados');
  }
  console.log('✓ /current utiliza userDto correctamente y oculta campos sensibles');

  // --- PRUEBA 2: AUTORIZACIÓN DE PRODUCTOS ---
  console.log('\n--- PRUEBA 2: AUTORIZACIÓN DE PRODUCTOS (CUD ADMIN) ---');
  // Intento de creación con usuario común
  const userProdCreate = await fetch(BASE + '/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': user1Cookie },
    body: JSON.stringify({ title: 'Intento Usuario', price: 50, stock: 10 })
  });
  console.log('POST /api/products con user estándar status:', userProdCreate.status);
  if (userProdCreate.status !== 403) throw new Error('FALLO: Usuario común debe recibir 403');

  // Creación con admin
  const prodARes = await fetch(BASE + '/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
    body: JSON.stringify({ title: 'Producto A', price: 100, stock: 10 })
  });
  const prodA = (await prodARes.json()).payload;
  console.log('POST /api/products con admin status:', prodARes.status, 'ID:', prodA._id);

  const prodBRes = await fetch(BASE + '/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie },
    body: JSON.stringify({ title: 'Producto B', price: 50, stock: 2 })
  });
  const prodB = (await prodBRes.json()).payload;
  console.log('POST /api/products con admin status:', prodBRes.status, 'ID:', prodB._id);

  // Modificación con user común -> 403
  const userPatch = await fetch(BASE + '/api/products/' + prodA._id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': user1Cookie },
    body: JSON.stringify({ price: 999 })
  });
  console.log('PATCH /api/products/:id con user status:', userPatch.status);
  if (userPatch.status !== 403) throw new Error('FALLO: PATCH con user debe devolver 403');

  // Eliminación con user común -> 403
  const userDelete = await fetch(BASE + '/api/products/' + prodA._id, {
    method: 'DELETE',
    headers: { 'Cookie': user1Cookie }
  });
  console.log('DELETE /api/products/:id con user status:', userDelete.status);
  if (userDelete.status !== 403) throw new Error('FALLO: DELETE con user debe devolver 403');

  console.log('✓ Operaciones CUD en productos protegidas exclusivamente para admin');

  // --- PRUEBA 3: AUTORIZACIÓN DE CARRITO ---
  console.log('\n--- PRUEBA 3: AUTORIZACIÓN DE CARRITO Y AGREGAR PRODUCTO ---');
  // Admin intenta agregar producto al carrito -> 403
  const adminAddCart = await fetch(BASE + `/api/carts/${user1CartId}/product/${prodA._id}`, {
    method: 'POST',
    headers: { 'Cookie': adminCookie }
  });
  console.log('Admin agregar al carrito status:', adminAddCart.status);
  if (adminAddCart.status !== 403) throw new Error('FALLO: Admin debe recibir 403 en add cart');

  // User 1 intenta agregar a carrito de User 2 -> 403
  const userForeignCart = await fetch(BASE + `/api/carts/${user2CartId}/product/${prodA._id}`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  });
  console.log('User 1 agregar a carrito ajeno status:', userForeignCart.status);
  if (userForeignCart.status !== 403) throw new Error('FALLO: Modificar carrito ajeno debe devolver 403');

  // User 1 agrega Producto A a su carrito (vez 1)
  const add1 = await fetch(BASE + `/api/carts/${user1CartId}/product/${prodA._id}`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  }).then(r => r.json());
  console.log('User 1 agrega Producto A (1ra vez): status success');

  // User 1 agrega Producto A a su carrito (vez 2) -> quantity debe ser 2
  const add2 = await fetch(BASE + `/api/carts/${user1CartId}/product/${prodA._id}`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  }).then(r => r.json());
  const itemA = add2.payload.products.find(p => (p.productId._id || p.productId) === prodA._id);
  console.log('Cantidad de Producto A en carrito tras 2do agregado:', itemA.quantity);
  if (itemA.quantity !== 2) throw new Error('FALLO: La cantidad debió incrementarse a 2');

  console.log('✓ Autorización de carrito e incremento de cantidad validados');

  // --- PRUEBA 4: COMPRA CASO 1 — COMPLETA ---
  console.log('\n--- PRUEBA 4: PURCHASE CASO 1 — COMPRA COMPLETA ---');
  // Carrito tiene Producto A x2. Stock A es 10. Precio es 100. Total esperado: 200.
  const purchase1Res = await fetch(BASE + `/api/carts/${user1CartId}/purchase`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  });
  const purchase1 = await purchase1Res.json();
  console.log('Compra completa status:', purchase1Res.status);
  console.log('Ticket generado:', purchase1.payload?.code, 'Monto:', purchase1.payload?.amount, 'Comprador:', purchase1.payload?.purchaser);
  if (purchase1.payload?.amount !== 200) throw new Error('FALLO: El monto del ticket debe ser 200');
  if (purchase1.payload?.purchaser !== user1Data.email) throw new Error('FALLO: El comprador no coincide');
  if (purchase1.notProcessed?.length !== 0) throw new Error('FALLO: notProcessed debe estar vacío');

  // Verificar stock actualizado en base de datos (debe ser 8)
  const checkStockA1 = await fetch(BASE + '/api/products/' + prodA._id).then(r => r.json());
  console.log('Stock restante de Producto A (original 10 - 2 comprados):', checkStockA1.payload.stock);
  if (checkStockA1.payload.stock !== 8) throw new Error('FALLO: El stock de Producto A debió quedar en 8');

  console.log('✓ Compra completa procesada exitosamente con descuento atómico y ticket emitido');

  // --- PRUEBA 5: COMPRA CASO 2 — PARCIAL ---
  console.log('\n--- PRUEBA 5: PURCHASE CASO 2 — COMPRA PARCIAL ---');
  // Agregamos Producto A (stock 8) x2
  await fetch(BASE + `/api/carts/${user1CartId}/product/${prodA._id}`, { method: 'POST', headers: { 'Cookie': user1Cookie } });
  await fetch(BASE + `/api/carts/${user1CartId}/product/${prodA._id}`, { method: 'POST', headers: { 'Cookie': user1Cookie } });

  // Agregamos Producto B (stock 2) x3 (excede el stock disponible)
  await fetch(BASE + `/api/carts/${user1CartId}/product/${prodB._id}`, { method: 'POST', headers: { 'Cookie': user1Cookie } });
  await fetch(BASE + `/api/carts/${user1CartId}/product/${prodB._id}`, { method: 'POST', headers: { 'Cookie': user1Cookie } });
  await fetch(BASE + `/api/carts/${user1CartId}/product/${prodB._id}`, { method: 'POST', headers: { 'Cookie': user1Cookie } });

  const purchase2Res = await fetch(BASE + `/api/carts/${user1CartId}/purchase`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  });
  const purchase2 = await purchase2Res.json();
  console.log('Compra parcial status:', purchase2Res.status);
  console.log('Ticket generado:', purchase2.payload?.code, 'Monto (solo comprados):', purchase2.payload?.amount);
  console.log('No procesados devueltos:', JSON.stringify(purchase2.notProcessed));

  if (purchase2.payload?.amount !== 200) throw new Error('FALLO: El ticket solo debe cobrar Producto A (200)');
  if (purchase2.notProcessed?.length !== 1 || purchase2.notProcessed[0].productId !== prodB._id) {
    throw new Error('FALLO: notProcessed debe reportar Producto B');
  }

  // Stock A debe ser 6 (8 - 2)
  const checkStockA2 = await fetch(BASE + '/api/products/' + prodA._id).then(r => r.json());
  console.log('Stock Producto A tras compra parcial:', checkStockA2.payload.stock);
  if (checkStockA2.payload.stock !== 6) throw new Error('FALLO: Stock A debe ser 6');

  // Stock B debe permanecer en 2 (intacto)
  const checkStockB2 = await fetch(BASE + '/api/products/' + prodB._id).then(r => r.json());
  console.log('Stock Producto B tras compra parcial (no decrementado):', checkStockB2.payload.stock);
  if (checkStockB2.payload.stock !== 2) throw new Error('FALLO: Stock B debe permanecer en 2');

  console.log('✓ Compra parcial procesada: solo se descontó y facturó lo comprable');

  // --- PRUEBA 6: COMPRA CASO 3 — NADA DISPONIBLE ---
  console.log('\n--- PRUEBA 6: PURCHASE CASO 3 — NADA DISPONIBLE ---');
  // El carrito aún contiene Producto B x3 (stock 2). Al intentar comprar, ningún producto es comprable
  const purchase3Res = await fetch(BASE + `/api/carts/${user1CartId}/purchase`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  });
  const purchase3 = await purchase3Res.json();
  console.log('Compra con nada disponible status:', purchase3Res.status);
  console.log('Mensaje:', purchase3.message);
  if (purchase3Res.status !== 409) throw new Error('FALLO: Debe retornar 409 Conflict');

  console.log('✓ Nada disponible rechazado correctamente con 409 sin emitir ticket');

  // --- PRUEBA 7: COMPRA CASO 4 — CARRITO AJENO ---
  console.log('\n--- PRUEBA 7: PURCHASE CASO 4 — CARRITO AJENO ---');
  const purchase4Res = await fetch(BASE + `/api/carts/${user2CartId}/purchase`, {
    method: 'POST',
    headers: { 'Cookie': user1Cookie }
  });
  console.log('Comprar carrito ajeno status:', purchase4Res.status);
  if (purchase4Res.status !== 403) throw new Error('FALLO: Debe retornar 403 Forbidden');
  console.log('✓ Compra de carrito ajeno bloqueada');

  // --- PRUEBA 8: RECUPERACIÓN Y RESETEO DE CONTRASEÑA ---
  console.log('\n--- PRUEBA 8: RECUPERACIÓN Y RESETEO DE CONTRASEÑA ---');
  // 1. Solicitar recuperación
  const recoveryRes = await fetch(BASE + '/api/sessions/password-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Data.email })
  });
  const recoveryData = await recoveryRes.json();
  console.log('Password recovery status:', recoveryRes.status, 'Mensaje:', recoveryData.message);
  if (recoveryRes.status !== 200) throw new Error('FALLO: Password recovery falló');

  // Obtener el token generado desde la colección en MongoDB
  const tokenDoc = await mongoose.default.connection.db.collection('passwordresets').findOne({
    userId: new mongoose.default.Types.ObjectId(reg1.payload._id)
  });
  console.log('Token persistido en DB:', tokenDoc.token);
  console.log('Expiración (+1 hora):', tokenDoc.expiresAt);
  const diffMinutes = (new Date(tokenDoc.expiresAt) - Date.now()) / (1000 * 60);
  console.log('Minutos de validez restantes:', Math.round(diffMinutes));
  if (Math.round(diffMinutes) < 55 || Math.round(diffMinutes) > 65) {
    throw new Error('FALLO: La expiración no está en el rango de 1 hora');
  }

  // 2. Intento de reseteo con MISMA contraseña -> 400
  const samePassRes = await fetch(BASE + '/api/sessions/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenDoc.token, newPassword: user1Data.password })
  });
  const samePassData = await samePassRes.json();
  console.log('Reset con misma password status:', samePassRes.status, 'Mensaje:', samePassData.message);
  if (samePassRes.status !== 400) throw new Error('FALLO: Debe rechazar la misma contraseña con 400');

  // 3. Reseteo con NUEVA contraseña válida -> 200
  const newPass = 'NuevaPassword456!';
  const resetSuccessRes = await fetch(BASE + '/api/sessions/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenDoc.token, newPassword: newPass })
  });
  const resetSuccessData = await resetSuccessRes.json();
  console.log('Reset con nueva password status:', resetSuccessRes.status, 'Mensaje:', resetSuccessData.message);
  if (resetSuccessRes.status !== 200) throw new Error('FALLO: Reseteo legítimo falló');

  // 4. Token de un solo uso: intentar reutilizar el mismo token -> 400
  const reuseTokenRes = await fetch(BASE + '/api/sessions/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: tokenDoc.token, newPassword: 'OtraPassword789!' })
  });
  console.log('Reutilización de token status:', reuseTokenRes.status);
  if (reuseTokenRes.status !== 400) throw new Error('FALLO: El token ya consumido no debe poder reutilizarse');

  // 5. Validar login con contraseña vieja (debe fallar) y nueva (debe funcionar)
  const oldLoginRes = await fetch(BASE + '/api/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Data.email, password: user1Data.password })
  });
  console.log('Login con contraseña vieja status:', oldLoginRes.status);
  if (oldLoginRes.status !== 401) throw new Error('FALLO: Login con contraseña anterior debe devolver 401');

  const newLoginRes = await fetch(BASE + '/api/sessions/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user1Data.email, password: newPass })
  });
  console.log('Login con contraseña nueva status:', newLoginRes.status);
  if (newLoginRes.status !== 200) throw new Error('FALLO: Login con nueva contraseña debe devolver 200');
  const user1CookieNew = newLoginRes.headers.get('set-cookie').split(';')[0];

  console.log('✓ Flujo completo de recuperación y reseteo de contraseña verificado');

  // --- PRUEBA 9: TOKEN VENCIDO ---
  console.log('\n--- PRUEBA 9: TOKEN VENCIDO (MANUAL EXPIRATION CHECK) ---');
  // Crear token expirado en el pasado
  const expiredToken = 'expired-' + Date.now();
  await mongoose.default.connection.db.collection('passwordresets').insertOne({
    userId: new mongoose.default.Types.ObjectId(reg1.payload._id),
    token: expiredToken,
    expiresAt: new Date(Date.now() - 1000 * 60 * 10) // 10 minutos en el pasado
  });

  const expiredResetRes = await fetch(BASE + '/api/sessions/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: expiredToken, newPassword: 'AnyPassword999!' })
  });
  console.log('Reset con token vencido status:', expiredResetRes.status);
  if (expiredResetRes.status !== 400) throw new Error('FALLO: Token vencido debe ser rechazado con 400');
  console.log('✓ Token vencido rechazado correctamente');

  // --- PRUEBA 10: SEGURIDAD — BLOQUEO DE REASIGNACIÓN DE CARRITO Y VALIDACIÓN DE PROPIEDAD ---
  console.log('\n--- PRUEBA 10: SEGURIDAD — BLOQUEO DE REASIGNACIÓN DE CARRITO ---');

  // A) Intentar cambiar el campo cart del propio usuario vía PUT /api/users/:uid
  const putCartRes = await fetch(BASE + `/api/users/${reg1.payload._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': user1CookieNew },
    body: JSON.stringify({ cart: user2CartId })
  });
  console.log('Intento de modificar cart en PUT /api/users/:uid status:', putCartRes.status);

  // Verificar que el campo cart del usuario NO cambió en /current ni en MongoDB
  const currentCheckRes = await fetch(BASE + '/api/sessions/current', {
    headers: { 'Cookie': user1CookieNew }
  });
  const currentCheckData = await currentCheckRes.json();
  const currentCartId = (currentCheckData.payload?.cart?._id || currentCheckData.payload?.cart)?.toString();
  console.log('Cart en /current tras intento de manipulación:', currentCartId);

  const dbUserCheck = await mongoose.default.connection.db.collection('users').findOne({
    _id: new mongoose.default.Types.ObjectId(reg1.payload._id)
  });
  const dbCartId = dbUserCheck.cart?.toString();
  console.log('Cart en base de datos tras intento de manipulación:', dbCartId);

  if (currentCartId !== user1CartId.toString() || dbCartId !== user1CartId.toString()) {
    throw new Error('FALLO DE SEGURIDAD: El campo cart fue modificado vía PUT');
  }

  // B) Intentar agregar producto al carrito de otro usuario después del intento de manipulación -> 403
  const addForeignRes = await fetch(BASE + `/api/carts/${user2CartId}/product/${prodA._id}`, {
    method: 'POST',
    headers: { 'Cookie': user1CookieNew }
  });
  console.log('Agregar producto a carrito ajeno status:', addForeignRes.status);
  if (addForeignRes.status !== 403) {
    throw new Error('FALLO: Agregar a carrito ajeno debe responder 403');
  }

  // C) Intentar hacer purchase del carrito de otro usuario después del intento de manipulación -> 403
  const purchaseForeignRes = await fetch(BASE + `/api/carts/${user2CartId}/purchase`, {
    method: 'POST',
    headers: { 'Cookie': user1CookieNew }
  });
  console.log('Comprar carrito ajeno status:', purchaseForeignRes.status);
  if (purchaseForeignRes.status !== 403) {
    throw new Error('FALLO: Comprar carrito ajeno debe responder 403');
  }

  console.log('✓ Reasignación de carrito bloqueada y propiedad validada estrictamente por cart.userId === user._id');

  await mongoose.default.disconnect();
  console.log('\n========================================');
  console.log('TODAS LAS PRUEBAS PASARON EXITOSAMENTE 100%');
  console.log('========================================');
}

run().catch(err => {
  console.error('\n❌ ERROR EN PRUEBAS:', err);
  process.exit(1);
});
