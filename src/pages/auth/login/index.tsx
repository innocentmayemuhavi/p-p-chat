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

const LoginPage = () => {
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.emailOrMobile || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Login successful!");
      navigate(ROUTES.CHAT);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <FormCard>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to continue chatting</Subtitle>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="emailOrMobile">Email or Mobile Number</Label>
            <Input
              id="emailOrMobile"
              type="text"
              placeholder="Enter your email or mobile"
              value={formData.emailOrMobile}
              onChange={(e) =>
                setFormData({ ...formData, emailOrMobile: e.target.value })
              }
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </InputGroup>

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form>

        <Footer>
          Don't have an account?{" "}
          <StyledLink to={ROUTES.SIGNUP}>Sign up</StyledLink>
        </Footer>
      </FormCard>
    </Container>
  );
};

export default LoginPage;
