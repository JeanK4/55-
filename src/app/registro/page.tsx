'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { crearUsuario, calcularEdad, crearVinculoCuidador, obtenerAdultoPorCodigo } from '@/lib/store';
import type { Rol } from '@/lib/types';
import { UserPlus, AlertCircle, Check } from 'lucide-react';

export default function RegistroPage() {
  const { iniciarSesion } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rolParam = searchParams.get('rol');
  const rolInicial = (rolParam === 'proveedor' || rolParam === 'cuidador' ? rolParam : 'adulto_mayor') as Rol;
  const [rol, setRol] = useState<Rol>(rolInicial);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [intereses, setIntereses] = useState<string[]>([]);
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [documento, setDocumento] = useState('');
  const [condicionFisica, setCondicionFisica] = useState('');
  const [codigoVinculo, setCodigoVinculo] = useState('');
  const [error, setError] = useState('');

  const interesesDisponibles = [
    'Caminatas', 'Yoga', 'Lectura', 'Música', 'Arte', 'Cocina',
    'Baile', 'Cine', 'Naturaleza', 'Meditación', 'Tecnología', 'Voluntariado',
  ];

  const toggleInteres = (interes: string) => {
    setIntereses(prev =>
      prev.includes(interes) ? prev.filter(i => i !== interes) : [...prev, interes]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación R-1: edad mínima para adulto mayor
    if (rol === 'adulto_mayor') {
      if (!fechaNacimiento) {
        setError('Necesitamos tu fecha de nacimiento para verificar la edad.');
        return;
      }
      if (!documento.trim()) {
        setError('Necesitamos tu número de documento para verificar la edad.');
        return;
      }
      const edad = calcularEdad(fechaNacimiento);
      if (edad < 55) {
        setError(`Esta plataforma es para personas de 55 años o más. Tu edad calculada es ${edad}.`);
        return;
      }
      if (edad > 110) {
        setError('La fecha de nacimiento no parece válida. ¿Puedes revisarla?');
        return;
      }
    }

    try {
      let adultoVinculadoId: string | undefined;
      if (rol === 'cuidador') {
        if (!codigoVinculo.trim()) {
          setError('Necesitamos el código de vinculación del adulto mayor.');
          return;
        }
        const adulto = obtenerAdultoPorCodigo(codigoVinculo.trim());
        if (!adulto) {
          setError('El código no es válido o no pertenece a un adulto mayor.');
          return;
        }
        adultoVinculadoId = adulto.id;
      }

      const nuevo = crearUsuario({
        nombre: nombre.trim(),
        correo: correo.trim(),
        rol,
        fechaNacimiento: rol === 'adulto_mayor' ? fechaNacimiento : undefined,
        intereses: rol === 'adulto_mayor' ? intereses : undefined,
        telefono: telefono.trim() || undefined,
        ciudad: ciudad.trim() || undefined,
        direccion: direccion.trim() || undefined,
        documento: documento.trim() || undefined,
        condicionFisica: rol === 'adulto_mayor' ? condicionFisica.trim() || undefined : undefined,
        verificado: true,
      });
      if (rol === 'cuidador' && adultoVinculadoId) {
        crearVinculoCuidador(adultoVinculadoId, nuevo.id);
      }
      iniciarSesion(nuevo);
      if (nuevo.rol === 'proveedor') router.push('/proveedor');
      else router.push('/actividades');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear la cuenta.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 lg:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl lg:text-5xl text-ink mb-3">
          Crea tu cuenta
        </h1>
        <p className="text-coffee/80">
          Toma menos de un minuto. No te pediremos contraseña en este Sprint.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-cream rounded-soft border border-coffee/10 p-8 lg:p-10 space-y-8 shadow-soft"
      >
        {/* Selector de rol */}
        <div>
          <label className="block text-base font-semibold text-ink mb-3">
            ¿Cómo te quieres registrar?
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRol('adulto_mayor')}
              className={`p-5 rounded-soft border-2 text-left transition-colors ${
                rol === 'adulto_mayor'
                  ? 'border-clay bg-clay/5'
                  : 'border-coffee/20 hover:border-coffee/40'
              }`}
            >
              <div className="text-3xl mb-2">👵</div>
              <div className="font-semibold text-ink">Como adulto mayor</div>
              <div className="text-sm text-coffee/70">Para descubrir y reservar actividades</div>
            </button>
            <button
              type="button"
              onClick={() => setRol('proveedor')}
              className={`p-5 rounded-soft border-2 text-left transition-colors ${
                rol === 'proveedor'
                  ? 'border-clay bg-clay/5'
                  : 'border-coffee/20 hover:border-coffee/40'
              }`}
            >
              <div className="text-3xl mb-2">🏛️</div>
              <div className="font-semibold text-ink">Como proveedor</div>
              <div className="text-sm text-coffee/70">Centro o entidad que ofrece actividades</div>
            </button>
            <button
              type="button"
              onClick={() => setRol('cuidador')}
              className={`p-5 rounded-soft border-2 text-left transition-colors ${
                rol === 'cuidador'
                  ? 'border-clay bg-clay/5'
                  : 'border-coffee/20 hover:border-coffee/40'
              }`}
            >
              <div className="text-3xl mb-2">🧑‍⚕️</div>
              <div className="font-semibold text-ink">Como cuidador</div>
              <div className="text-sm text-coffee/70">Acompañar y monitorear a un adulto mayor</div>
            </button>
          </div>
        </div>

        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-base font-semibold text-ink mb-2">
            {rol === 'proveedor' ? 'Nombre del centro o entidad' : 'Tu nombre completo'}
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            placeholder={rol === 'proveedor' ? 'Centro Cultural...' : 'María González'}
            className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Correo */}
        <div>
          <label htmlFor="correo" className="block text-base font-semibold text-ink mb-2">
            Correo electrónico
          </label>
          <input
            id="correo"
            type="email"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            required
            placeholder="ejemplo@correo.com"
            className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Teléfono y ciudad */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="telefono" className="block text-base font-semibold text-ink mb-2">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="300 123 4567"
              className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="ciudad" className="block text-base font-semibold text-ink mb-2">
              Ciudad
            </label>
            <input
              id="ciudad"
              type="text"
              value={ciudad}
              onChange={e => setCiudad(e.target.value)}
              placeholder="Cali"
              className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="direccion" className="block text-base font-semibold text-ink mb-2">
            Dirección (opcional)
          </label>
          <input
            id="direccion"
            type="text"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            placeholder="Barrio, referencia o dirección"
            className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Documento */}
        <div>
          <label htmlFor="documento" className="block text-base font-semibold text-ink mb-2">
            Documento de identidad
          </label>
          <input
            id="documento"
            type="text"
            value={documento}
            onChange={e => setDocumento(e.target.value)}
            required={rol === 'adulto_mayor'}
            placeholder="Número de cédula"
            className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
          />
        </div>

        {/* Fecha de nacimiento (solo adulto mayor) */}
        {rol === 'adulto_mayor' && (
          <div>
            <label htmlFor="fecha" className="block text-base font-semibold text-ink mb-2">
              Fecha de nacimiento
            </label>
            <input
              id="fecha"
              type="date"
              value={fechaNacimiento}
              onChange={e => setFechaNacimiento(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
            />
            <p className="text-sm text-coffee/60 mt-2">
              Verificaremos que tengas 55 años o más. (Restricción R-1 del SRS).
            </p>
          </div>
        )}

        {rol === 'adulto_mayor' && (
          <div>
            <label htmlFor="condicion" className="block text-base font-semibold text-ink mb-2">
              Condición física (opcional)
            </label>
            <textarea
              id="condicion"
              rows={3}
              value={condicionFisica}
              onChange={e => setCondicionFisica(e.target.value)}
              placeholder="Ej: movilidad moderada, hipertensión controlada..."
              className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors resize-none"
            />
          </div>
        )}

        {rol === 'cuidador' && (
          <div>
            <label htmlFor="codigo" className="block text-base font-semibold text-ink mb-2">
              Código de vinculación del adulto mayor
            </label>
            <input
              id="codigo"
              type="text"
              value={codigoVinculo}
              onChange={e => setCodigoVinculo(e.target.value)}
              required
              placeholder="C55-XXXXXX"
              className="w-full px-5 py-4 text-lg rounded-soft border-2 border-coffee/20 bg-cream focus:border-clay focus:outline-none transition-colors"
            />
            <p className="text-sm text-coffee/60 mt-2">
              El adulto mayor puede ver su código en la sección Mi perfil.
            </p>
          </div>
        )}

        {/* Intereses (solo adulto mayor) */}
        {rol === 'adulto_mayor' && (
          <div>
            <label className="block text-base font-semibold text-ink mb-2">
              ¿Qué te interesa? <span className="font-normal text-coffee/60">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {interesesDisponibles.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleInteres(i)}
                  className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${
                    intereses.includes(i)
                      ? 'bg-ink text-cream'
                      : 'bg-sand text-ink hover:bg-coffee/15'
                  }`}
                >
                  {intereses.includes(i) && <Check className="w-3.5 h-3.5 inline mr-1" />}
                  {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-soft bg-clay/10 border border-clay/30">
            <AlertCircle className="w-5 h-5 text-clay flex-shrink-0 mt-0.5" />
            <p className="text-sm text-coffee">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-pill bg-clay text-cream text-lg font-semibold hover:bg-coffee transition-colors shadow-soft"
        >
          <UserPlus className="w-5 h-5" />
          Crear mi cuenta
        </button>

        <p className="text-center text-coffee/80">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-clay hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
