import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import FormItem from 'antd/es/form/FormItem';

import FormCard from '@/src/components/FormCard';
import { SignUpData } from '@/src/types/api';

const SignUpFormItem = FormItem<SignUpData>;

interface SignUpFormProps {
  onSignIn: () => void;
}

const SignUpForm = ({ onSignIn }: SignUpFormProps) => {
  return (
    <FormCard title="FakeOut Labs">
      <Form name="signup">
        <SignUpFormItem
          name="username"
          rules={[{ required: true, message: 'Please input your Username!' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </SignUpFormItem>
        <SignUpFormItem
          name="password"
          rules={[{ required: true, message: 'Please input your Password!' }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </SignUpFormItem>
        <SignUpFormItem
          name="password"
          rules={[{ required: true, message: 'Please confirm your Password!' }]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Confirm password"
          />
        </SignUpFormItem>
        <FormItem>
          <Button block type="primary" htmlType="submit">
            Sign up
          </Button>
        </FormItem>
        <FormItem>
          <Button block type="link" onClick={onSignIn}>
            I already have an account
          </Button>
        </FormItem>
      </Form>
    </FormCard>
  );
};

export default SignUpForm;
