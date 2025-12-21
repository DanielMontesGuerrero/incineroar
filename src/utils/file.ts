export const readFile = async (file: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || !e.target.result) {
        return reject(new Error('Failed to read file'));
      }
      const content = e.target.result;
      resolve(content as string);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};
