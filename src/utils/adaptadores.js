const ROLES_POR_ID = {
  1: "superadmin",
  2: "administrador",
  3: "panadero",
  4: "domiciliario",
  5: "cliente",
};

export function rolDePanel(rol) {
  if (typeof rol === "number") {
    return ROLES_POR_ID[rol] ?? "cliente";
  }

  const nombre = String(rol ?? "").trim().toLowerCase();
  if (["superadmin", "administrador", "admin", "panadero", "domiciliario", "cliente"].includes(nombre)) {
    return nombre === "admin" ? "administrador" : nombre;
  }

  return ROLES_POR_ID[Number(nombre)] ?? "cliente";
}
