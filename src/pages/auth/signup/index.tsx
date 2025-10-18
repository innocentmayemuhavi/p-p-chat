import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import { authAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { COLORS, ROUTES } from "../../../shared/constants";

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${COLORS.BACKGROUND};
  align-items: center;
  justify-content: center;
  font-family: "Quicksand", sans-serif;
`;

const FormCard = styled.div`
  background: ${COLORS.WHITE};
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px var(--shadow-medium);
  width: 100%;
  max-width: 440px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${COLORS.TEXT_PRIMARY};
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${COLORS.TEXT_SECONDARY};
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${COLORS.TEXT_PRIMARY};
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1.5px solid ${COLORS.BORDER};
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: "Quicksand", sans-serif;
  transition: all 0.2s;
  background: ${COLORS.BACKGROUND};
  color: ${COLORS.TEXT_PRIMARY};

  &:focus {
    outline: none;
    border-color: ${COLORS.PRIMARY};
    box-shadow: 0 0 0 3px ${COLORS.PRIMARY}20;
  }

  &::placeholder {
    color: ${COLORS.TEXT_SECONDARY};
  }
`;

const Button = styled.button`
  padding: 0.875rem;
  background: ${COLORS.PRIMARY};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: "Quicksand", sans-serif;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    background: ${COLORS.PRIMARY_LIGHT};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  color: ${COLORS.TEXT_SECONDARY};
  font-size: 0.9rem;
`;

const StyledLink = styled(Link)`
  color: ${COLORS.PRIMARY};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      });
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Account created successfully!");
      navigate(ROUTES.CHAT);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Create Account</Title>
        <Subtitle>Join us and start chatting</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={(e) =>
                setFormData({ ...formData, mobile: e.target.value })
              }
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </Form>

        <Footer>
          Already have an account?{" "}
          <StyledLink to={ROUTES.LOGIN}>Sign in</StyledLink>
        </Footer>
      </FormCard>
    </Container>
  );
};

export default SignupPage;
