import { useParams } from 'react-router-dom';
import DepartmentManagementPage from './departmentmanagementpage.jsx';

function DepartmentFormPage({
  mode = 'add',
}) {
  const { departmentId } = useParams();

  return (
    <DepartmentManagementPage
      initialFormMode={mode}
      initialDepartmentId={departmentId}
    />
  );
}

export default DepartmentFormPage;
