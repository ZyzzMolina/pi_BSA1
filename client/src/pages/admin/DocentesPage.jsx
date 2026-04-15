import { GraduationCap } from 'lucide-react';
import CrudPage from './CrudPage';

const columns = [
    { key: 'id_docente', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'email', label: 'Email' },
    { key: 'especialidad', label: 'Especialidad' },
];

const formFields = [
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'apellido', label: 'Apellido', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'especialidad', label: 'Especialidad' },
];

const DocentesPage = () => (
    <CrudPage
        title="Docentes"
        icon={GraduationCap}
        endpoint="/docentes"
        columns={columns}
        formFields={formFields}
        entityName="docente"
    />
);

export default DocentesPage;
