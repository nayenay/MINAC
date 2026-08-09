import React, { Dispatch, SetStateAction, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Input from "@/components/Input";
import { Button } from "@heroui/react";
import { useEquipos } from "@/context/EquiposContext";
import type { CreateEquipoPayload } from "@/types/equipo";

interface AddEquipoModalProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}

function AddEquipoModal({ visible, setVisible }: AddEquipoModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateEquipoPayload>({
    defaultValues: {
      _id: "",
      ubicacion: "",
      altura: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { createEquipo } = useEquipos();

  const handleClose = () => {
    setVisible(false);
    setSubmitError(null);
    reset();
  };

  const onSubmit: SubmitHandler<CreateEquipoPayload> = async (data) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const payload: CreateEquipoPayload = {
        _id: data._id.trim(),
        ubicacion: data.ubicacion?.trim() || undefined,
        altura: data.altura?.trim() || undefined,
      };
      await createEquipo(payload);
      handleClose();
    } catch {
      setSubmitError(
        "No se pudo crear el equipo. Verifica el ID e intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={visible}
      onClose={handleClose}
      className="bg-[#171717]/95 w-[440px] h-auto min-h-[400px] p-1"
    >
      <ModalContent>
        <ModalHeader className="flex justify-center items-center">
          <h1 className="text-[20px] font-bold">Agregar Equipo</h1>
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col items-center justify-center gap-6"
          >
            <Controller
              name="_id"
              control={control}
              rules={{ required: "El ID es obligatorio" }}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="ID del equipo"
                  label="ID"
                  errorMessage={errors._id?.message}
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
                  errorMessage={errors.ubicacion?.message}
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
                  errorMessage={errors.altura?.message}
                />
              )}
            />
            {submitError ? (
              <p className="text-sm text-[#ff8a80] w-full text-left">
                {submitError}
              </p>
            ) : null}
            <div className="flex justify-between w-full">
              <Button
                variant="bordered"
                radius="full"
                className="border border-[#F8B519] text-[#F8B519] hover:bg-[#F8B519] hover:text-[#0F0F0F]"
                onClick={handleClose}
                type="button"
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
