'use client';

import { Col, Row } from 'antd';
import { useState } from 'react';

import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignUpForm';

type FormType = 'signin' | 'signup';

const Login = () => {
  const [formType, setFormType] = useState<FormType>('signin');

  return (
    <Row align="middle" justify="center" className="h-dvh">
      <Col xs={24} md={16} lg={8}>
        {formType === 'signin' ? (
          <SignInForm onSignUp={() => setFormType('signup')} />
        ) : (
          <SignUpForm onSignIn={() => setFormType('signin')} />
        )}
      </Col>
    </Row>
  );
};

export default Login;
