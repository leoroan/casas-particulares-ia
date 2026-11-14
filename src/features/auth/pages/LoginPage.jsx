import LoginForm from '../components/LoginForm.jsx';

export default function LoginPage({ onRegister }) {
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <LoginForm onRegister={onRegister} />
      </div>
    </div>
  );
}