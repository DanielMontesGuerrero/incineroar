import { encode } from '@razr/formdata';
import { FormItemProps } from 'antd';
import { useForm } from 'antd/es/form/Form';
import {
  TransitionStartFunction,
  useActionState,
  useEffect,
  useTransition,
} from 'react';

import { FormActionState } from '../types/form';

type FormDataObject = { [key: string]: unknown };

export const getValidateStatus = <T>(
  state: FormActionState<T>,
  key: keyof T,
  isPending: boolean,
): FormItemProps['validateStatus'] => {
  if (state.success) return 'success';
  if (state.errors?.[key]?.errors) return 'error';
  if (isPending) return 'validating';
  return '';
};

export const actionToOnFinishAdapter = <T extends FormDataObject>(
  values: T,
  formAction: (payload: FormData) => void,
  startTransition: TransitionStartFunction,
) => {
  const formData = encode(values);
  startTransition(() => {
    formAction(formData);
  });
};

const useFormAction = <T extends FormDataObject>(
  initial: FormActionState<T>,
  action: (
    state: Awaited<FormActionState<T>>,
    payload: FormData,
  ) => FormActionState<T> | Promise<FormActionState<T>>,
) => {
  const [state, formAction, isFormPending] = useActionState<
    FormActionState<T>,
    FormData
  >(action, initial);
  const [isTransitionPending, startTransition] = useTransition();
  const [form] = useForm<T>();

  const onFinish = (data: T) =>
    actionToOnFinishAdapter<T>(data, formAction, startTransition);

  useEffect(() => {
    if (!state.success) {
      const formFields = Object.keys(state.data).map((key) => ({
        name: key,
        value: state.data[key as keyof T],
        errors: state.errors?.[key as keyof T]?.errors,
      }));
      // @ts-expect-error missing FieldData type
      form.setFields(formFields);
    }
  }, [form, state]);

  return {
    isPending: isFormPending || isTransitionPending,
    form,
    onFinish,
    state,
  };
};

export default useFormAction;
