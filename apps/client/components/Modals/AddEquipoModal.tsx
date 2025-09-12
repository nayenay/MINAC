import React, { Dispatch, SetStateAction, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import * as yup from "yup";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Input from "@/components/Input";
import { Button } from "@heroui/react";
import { useEquipos } from "@/context/EquiposContext";

interface AddEquipoModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const schema = yup.object().shape({
  _id: yup.string().required(),
  ubicacion: yup.string().nullable(),
  altura: yup.string().nullable(),
});

function AddEquipoModal({ visible, setVisible }: AddEquipoModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const { createEquipo } = useEquipos();

  const handleClose = () => {
    setVisible(false);
    reset();
  };

  const onSubmit: SubmitHandler<any> = async (data) => {
    setLoading(true);
    createEquipo(data);
    setLoading(false);
    handleClose();
  };

  return (
    <Modal
      isOpen={visible}
      onClose={() => setVisible(false)}
      className="bg-[#171717]/95 w-[440px] h-[400px] p-1"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center items-center">
          <h1 className="text-[20px] font-bold">Agregar Equipo</h1>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center gap-6">
            <Controller
              name="_id"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="ID del equipo"
                  label="ID"
                  {...field}
                  errorMessage={errors._id?.message as string}
                />
              )}
            />
            <Controller
              name="ubicacion"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Ubicacion del equipo"
                  label="Ubicacion"
                  {...field}
                  errorMessage={errors.ubicacion?.message as string}
                />
              )}
            />
            <Controller
              name="altura"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Altura del equipo"
                  label="Altura"
                  {...field}
                  errorMessage={errors.altura?.message as string}
                />
              )}
            />
            <div className="flex justify-between w-full">
              <Button
                variant="bordered"
                radius="full"
                className="border border-[#F8B519] text-[#F8B519] hover:bg-[#F8B519] hover:text-[#0F0F0F]"
                onClick={() => setVisible(false)}
              >
                Cancelar
              </Button>
              <Button
                radius="full"
                variant="solid"
                type="submit"
                isLoading={loading}
                className="bg-[#F8B519] hover:bg-[#F8B519] text-[#ffffff] font-bold text-[16px]"
              >
                {loading ? "Cargando..." : "Agregar"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default AddEquipoModal;
