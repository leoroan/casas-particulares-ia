import RegisterForm from '../components/RegisterForm.jsx';

export default function RegisterPage({ onLogin }) {
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <RegisterForm onLogin={onLogin} />
      </div>
    </div>
  );
}