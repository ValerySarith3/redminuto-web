// Pruebas de extremo a extremo de RedMinuto con Selenium WebDriver (Chrome).
// Uso: E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
// Necesita la web (BASE_URL, por defecto el build en http://localhost:4173) y la API corriendo.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

const BASE = process.env.BASE_URL ?? "http://localhost:4173";
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? "admin@casaminutodedios.org";
const ADMIN_CLAVE = process.env.E2E_ADMIN_PASSWORD;
const CAPTURAS = path.join(import.meta.dirname, "capturas");
const CAMPANA = process.env.E2E_CAMPANA ?? "Mercados navideños 2026";

const sello = Date.now();
const donante = { nombre: "Laura Gómez Pruebas", email: `laura.${sello}@pruebas.redminuto.co`, clave: `Dona${sello}x` };

let driver;
let n = 0;

async function captura(nombre) {
  n += 1;
  const archivo = path.join(CAPTURAS, `${String(n).padStart(2, "0")}-${nombre}.png`);
  fs.writeFileSync(archivo, await driver.takeScreenshot(), "base64");
}
const porTexto = (texto, tag = "*") => By.xpath(`//${tag}[contains(normalize-space(.), "${texto}")]`);
// Las tarjetas aparecen con animación al entrar en pantalla: primero se lleva el elemento a la vista.
const visible = async (locator, ms = 10000) => {
  const el = await driver.wait(until.elementLocated(locator), ms);
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", el);
  return driver.wait(until.elementIsVisible(el), ms);
};
const escribir = async (css, texto) => {
  const el = await visible(By.css(css));
  await el.clear();
  await el.sendKeys(texto);
};
async function cerrarSesion() {
  await driver.get(BASE + "/");
  await driver.executeScript("localStorage.clear(); sessionStorage.clear();");
}
async function ingresar(email, clave) {
  await driver.get(BASE + "/auth");
  await escribir("input[type=email]", email);
  await escribir("input[autocomplete=current-password]", clave);
  await driver.findElement(By.css("form button[type=submit]")).click();
}

before(async () => {
  fs.mkdirSync(CAPTURAS, { recursive: true });
  const opciones = new chrome.Options().addArguments("--window-size=1366,900", "--lang=es-CO");
  if (process.env.HEADLESS !== "0") opciones.addArguments("--headless=new");
  driver = await new Builder().forBrowser("chrome").setChromeOptions(opciones).build();
});
after(async () => driver?.quit());

test("1. La página de inicio carga y muestra las campañas activas", async () => {
  await driver.get(BASE + "/");
  await visible(porTexto(CAMPANA, "h3"), 15000);
  assert.equal(await driver.getTitle(), "RedMinuto");
  await driver.executeScript("arguments[0].scrollIntoView({block:'center'})", await driver.findElement(porTexto(CAMPANA, "h3")));
  await driver.sleep(800);
  await captura("inicio-campanas");
});

test("2. Una ruta protegida sin sesión redirige al inicio de sesión", async () => {
  await cerrarSesion();
  await driver.get(BASE + "/dashboard");
  await driver.wait(until.urlContains("/auth"), 10000);
  await captura("ruta-protegida-redirige");
});

test("3. El inicio de sesión con contraseña incorrecta muestra un error", async () => {
  await ingresar(ADMIN_EMAIL, "ClaveIncorrecta123");
  const alerta = await visible(porTexto("Credenciales inválidas"));
  assert.match(await alerta.getText(), /Credenciales inválidas/);
  assert.ok((await driver.getCurrentUrl()).includes("/auth"));
  await captura("login-incorrecto");
});

test("4. El registro exige aceptar la política de tratamiento de datos", async () => {
  await driver.get(BASE + "/auth");
  await driver.findElement(porTexto("Registrarme", "button")).click();
  await escribir("input[autocomplete=name]", donante.nombre);
  await escribir("input[type=email]", donante.email);
  const claves = await driver.findElements(By.css("input[autocomplete=new-password]"));
  await claves[0].sendKeys(donante.clave);
  await claves[1].sendKeys(donante.clave);
  await driver.findElement(By.css("form button[type=submit]")).click();
  await visible(porTexto("Debes aceptar la política"));
  await captura("registro-sin-aceptar-politica");
});

test("5. El registro completo crea la cuenta e inicia sesión", async () => {
  await driver.findElement(By.css("input[type=checkbox]")).click();
  await driver.findElement(By.css("form button[type=submit]")).click();
  await driver.wait(until.urlIs(BASE + "/"), 15000);
  await visible(porTexto("Laura", "span"));
  await captura("registro-exitoso");
});

test("6. Un donante registra una donación por transferencia", async () => {
  const boton = await visible(
    By.xpath(`//h3[contains(., "${CAMPANA}")]/ancestor::*[.//button[contains(., "Donar")]][1]//button[contains(., "Donar")]`),
  );
  await driver.sleep(1200); // termina la animación de entrada de la tarjeta
  await boton.click();
  await visible(porTexto(`Donar a ${CAMPANA}`, "h3"));
  const canal = await driver.findElement(By.xpath(`//select[option[@value="TRANSFERENCIA"]]`));
  await canal.findElement(By.css("option[value=TRANSFERENCIA]")).click();
  await driver.sleep(400);
  await captura("formulario-donacion");
  await driver.findElement(porTexto("Confirmar donación", "button")).click();
  await visible(porTexto("¡Gracias por tu donación!", "h3"), 15000);
  await captura("donacion-registrada");
  await driver.findElement(porTexto("Listo", "button")).click();
});

test("7. El panel de seguimiento muestra la donación pendiente", async () => {
  await driver.get(BASE + "/dashboard");
  // La sección de donaciones viene plegada: se despliega para ver el detalle.
  await (await visible(porTexto("Mis donaciones", "button"), 15000)).click();
  await visible(porTexto(CAMPANA), 15000);
  await visible(porTexto("Pendiente"));
  await captura("seguimiento-donante");
});

test("8. La página de voluntariado lista las jornadas con cupo", async () => {
  await driver.get(BASE + "/voluntariado");
  await visible(porTexto("Inscribirme", "button"), 15000);
  await captura("voluntariado-jornadas");
});

test("9. Un usuario sin rol de administrador no puede entrar al panel", async () => {
  await driver.get(BASE + "/admin");
  await driver.wait(until.urlIs(BASE + "/"), 10000);
});

test("10. El administrador inicia sesión y ve el tablero y las donaciones", { skip: !ADMIN_CLAVE && "Falta E2E_ADMIN_PASSWORD" }, async () => {
  await cerrarSesion();
  await ingresar(ADMIN_EMAIL, ADMIN_CLAVE);
  await driver.wait(until.urlContains("/admin"), 15000);
  await driver.sleep(2500);
  await captura("admin-tablero");
  await driver.findElement(porTexto("Donaciones", "button")).click();
  await visible(porTexto(donante.nombre), 15000);
  await captura("admin-donaciones");
});

test("11. El inicio de sesión se bloquea tras varios intentos fallidos (fuerza bruta)", async () => {
  await cerrarSesion();
  let bloqueado = false;
  for (let i = 0; i < 12 && !bloqueado; i++) {
    await ingresar("atacante@pruebas.redminuto.co", `ClaveFalsa${i}`);
    await driver.sleep(700);
    bloqueado = (await driver.findElements(porTexto("Demasiados intentos"))).length > 0;
  }
  assert.ok(bloqueado, "La API debería responder 429 con el mensaje de bloqueo");
  await captura("login-bloqueado-fuerza-bruta");
});
