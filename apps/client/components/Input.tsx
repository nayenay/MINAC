import React from "react";
import { Input } from "@heroui/react";

interface InputMProps {
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  errorMessage?: string;
  label?: string;
  isReadOnly?: boolean;
}

function InputM({
  placeholder,
  type,
  value,
  onChange,
  icon,
  height,
  width,
  errorMessage,
  label,
  isReadOnly,
}: InputMProps) {
  return (
    <Input
      label={label}
      labelPlacement="outside"
      variant="bordered"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={onChange}
      startContent={icon}
      errorMessage={errorMessage}
      isInvalid={!!errorMessage}
      isReadOnly={isReadOnly}
      className="bg-[#171717] text-white rounded-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      classNames={{
        input: [
          "text-lg",
          "p-4",
          "border-none",
          "placeholder:text-[#333333]",
          "placeholder:font-medium",
          "bg-[#171717] text-white rounded-full  [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        ],
        label: [
          "text-[#333333]",
          "font-medium",
          "text-lg",
          "mb-2",
          "group-data-[focus=true]:text-[#F8B519]",
          "group-data-[hover=true]:text-[#F8B519]",
        ],
        inputWrapper: [
          "border-2",
          "border-[#333333]",
          "rounded-full",
          "group-data-[focus=true]:border-[#F8B519]",
          "group-data-[hover=true]:border-[#F8B519]",
        ],
        innerWrapper: ["border-none"],
      }}
      style={{ width: width, height: height, appearance: "textfield" }}
    />
  );
}

export default InputM;