import React from 'react';
import Select from 'react-select';
import { reactSelectCustomStyles } from './SelectStyle';

export type CategoryOption = {
  value: string;
  label: string;
};
export const categoryOptions: CategoryOption[] = [
  { value: "Food & Dining", label: "Food & Dining" },
  { value: "Housing & Utilities", label: "Housing & Utilities" },
  { value: "Transportation", label: "Transportation" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Entertainment & Leisure", label: "Entertainment & Leisure" },
  { value: "Shopping & Retail", label: "Shopping & Retail" },
  { value: "Travel & Vacations", label: "Travel & Vacations" },
  { value: "Education & Learning", label: "Education & Learning" },
  { value: "Finance & Insurance", label: "Finance & Insurance" },
  { value: "Other", label: "Other" },
];

interface Props {
  value: CategoryOption | null;
  onChange: (option: CategoryOption | null) => void;
  placeholder?: string;
  isClearable?: boolean;
}

const CategorySelect: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Select category',
  isClearable = false,
}) => {
  return (
    <div className="w-full">
    <Select<CategoryOption>
        options={categoryOptions}
        value={value}
        onChange={onChange}
        styles={reactSelectCustomStyles}
        placeholder={placeholder}
        isClearable={isClearable}
    />
    </div>

  );
};

export default CategorySelect;

