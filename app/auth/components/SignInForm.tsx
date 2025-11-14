import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import FormItem from 'antd/es/form/FormItem';

import FormCard from '@/src/components/FormCard';
import { SignInData } from '@/src/types/api';

const SignInFormItem = FormItem<SignInData>;

interface SignInFormProps {
  onSignUp: () => void;
}

const SignInForm = ({ onSignUp }: SignInFormProps) => {
  return (
    <FormCard title="FakeOut Labs">
      <Form name="signin">
        <SignInFormItem
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </SignInFormItem>
        <SignInFormItem
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </SignInFormItem>
        <FormItem>
          <Button block type="primary" htmlType="submit">
            Sign in
          </Button>
        </FormItem>
        <FormItem>
          <Button block type="link" onClick={onSignUp}>
            Sign up
          </Button>
        </FormItem>
      </Form>
    </FormCard>
  );
};

export default SignInForm;
