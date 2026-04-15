import { Users } from 'lucide-react';
import CrudPage from './CrudPage';

const columns = [
    { key: 'id_alumno', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
];

const formFields = [
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'fecha_nac', label: 'Fecha de Nacimiento', type: 'date' },
    { key: 'direccion', label: 'Dirección' },
];

const AlumnosPage = () => (
    <CrudPage
        title="Alumnos"
        icon={Users}
        endpoint="/alumnos"
        columns={columns}
        formFields={formFields}
        entityName="alumno"
    />
);

export default AlumnosPage;
