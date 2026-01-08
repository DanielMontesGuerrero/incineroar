import { render } from '@testing-library/react';

interface ItShouldContainFormItemsOptions<T extends object> {
  name?: string;
  formData: T;
  component: React.ReactNode;
  formName: string;
  prefix?: string;
}

export const itShouldContainFormItems = <T extends object>({
  name,
  component,
  formData,
  formName,
  prefix,
}: ItShouldContainFormItemsOptions<T>) => {
  const keys = Object.keys(formData);

  keys.forEach((_key) => {
    const key = _key as keyof T;

    if (Array.isArray(formData[key]) && formData[key].length !== 0) {
      return itShouldContainFormItems({
        name,
        component,
        formData: formData[key][0] as object,
        formName,
        prefix: `${prefix ? prefix + '_' : ''}${_key}_0`,
      });
    }

    it(
      (name ?? 'it should contain form item') +
        ` with name ${prefix ? prefix + '_' : ''}${_key}`,
      () => {
        render(component);
        const form = document.getElementById(formName);
        expect(form).toBeInTheDocument();
        const id = `${formName}_${prefix ? prefix + '_' : ''}${_key}`;
        let formItem = document.getElementById(id);
        if (!formItem) {
          formItem = document.querySelector(`[for="${id}"]`);
        }
        expect(formItem).toBeInTheDocument();
      },
    );
  });
};
