import React from "react";
import Button from "react-bootstrap/Button";

const AppButton = ({ type, onClick, variant, label, icono, className }) => {
  const IconComponent = icono || (() => null); // Un componente vacío por defecto si icono es nulo

  return (
    <>
      <Button className={className} type={type} onClick={onClick} variant={variant}>
        {icono ? <IconComponent /> : null} {/* Renderiza el IconComponent solo si icono no es nulo */}
        {icono ? null : label} {/* Renderiza el label solo si icono es nulo */}
      </Button>
    </>
  );
};

export default AppButton;

