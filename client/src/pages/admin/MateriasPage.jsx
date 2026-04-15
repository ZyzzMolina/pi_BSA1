import { BookOpen } from 'lucide-react';
import CrudPage from './CrudPage';

const columns = [
    { key: 'id_materia', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'clave', label: 'Clave' },
    { key: 'creditos', label: 'Créditos' },
    { key: 'descripcion', label: 'Descripción' },
];

const formFields = [
    { key: 'nombre', label: 'Nombre', required: true },
    { key: 'clave', label: 'Clave', required: true, placeholder: 'Ej: BDA-401' },
    { key: 'creditos', label: 'Créditos', type: 'number', required: true },
    { key: 'descripcion', label: 'Descripción' },
];

const MateriasPage = () => (
    <CrudPage
        title="Materias"
        icon={BookOpen}
        endpoint="/materias"
        columns={columns}
        formFields={formFields}
        entityName="materia"
    />
);

export default MateriasPage;
