import React from "react";
import {
  IconMicrowave,
  IconDeviceDesktopAnalytics,
  IconLogout,
  IconChartBar,
} from "@tabler/icons-react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "@heroui/react";
import { useRouter } from "next/router";

function Aside() {
  const router = useRouter();
  const path = router.pathname;
  const isMonitoreo = path === "/" || path.startsWith("/nodo");
  const isEquipos = path.startsWith("/equipos");

  return (
    <Sidebar
      backgroundColor="#171717"
      width="100%"
      style={{
        height: "100%",
        minHeight: "auto",
        paddingRight: "0",
        borderRight: "none",
      }}
      className="lg:!w-[260px]"
    >
      <Menu className="mb-2">
        <h3 className="px-7 py-5 text-xl font-bold text-[#F8B519]">MINAC</h3>
        <hr className="border border-[#333333]" />
      </Menu>
      <Menu
        menuItemStyles={{
          button: {
            ":hover": {
              backgroundColor: "#171717",
              color: "#F8B519",
            },
          },
          root: {
            marginBottom: "8px",
            marginTop: "8px",
            backgroundColor: "#171717",
          },
          subMenuContent: {
            backgroundColor: "#171717",
          },
        }}
      >
        <MenuItem
          className={`text-base font-medium ${
            isMonitoreo ? "text-[#F8B519]" : "text-white"
          }`}
          icon={<IconDeviceDesktopAnalytics />}
          active={isMonitoreo}
          onClick={() => router.push("/")}
        >
          Monitoreo
        </MenuItem>
        <MenuItem
          className={`text-base font-medium ${
            isEquipos ? "text-[#F8B519]" : "text-white"
          }`}
          icon={<IconMicrowave />}
          active={isEquipos}
          onClick={() => router.push("/equipos")}
        >
          Equipos
        </MenuItem>
        <MenuItem
          className="text-base font-medium text-[#666666]"
          icon={<IconChartBar />}
          disabled
          title="Próximamente"
        >
          Reportes (próximamente)
        </MenuItem>
      </Menu>
      <Menu className="mt-2 flex flex-col items-center justify-end px-4 pb-6 lg:mt-8">
        <Button
          variant="bordered"
          radius="full"
          isDisabled
          title="Autenticación no disponible"
          aria-disabled
          className="border border-[#555555] text-[#666666] opacity-60"
          startContent={<IconLogout size={24} />}
        >
          Cerrar sesión
        </Button>
      </Menu>
    </Sidebar>
  );
}

export default Aside;
