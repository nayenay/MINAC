import React from "react";
import {
  IconMicrowave,
  IconDeviceDesktopAnalytics,
  IconLogout,
  IconChartBar,
} from "@tabler/icons-react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Button } from "@heroui/react";
import { useRouter } from "next/router";

function Aside() {
  const router = useRouter();

  return (
    <Sidebar
      backgroundColor="#171717"
      width="280px"
      style={{ height: "100vh", paddingRight: "0", borderRight: "none" }}
    >
      <Menu className="mb-5">
        <h3 className="text-[#F8B519] text-xl font-bold px-7 py-5">MINAC</h3>
        {/*Se crea un divider */}
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
          //Agregar un espaciado entre los items
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
          className="text-white text-base font-medium "
          icon={<IconDeviceDesktopAnalytics />}
          onClick={() => router.push("/")}
        >
          Monitoreo
        </MenuItem>
        <MenuItem
          className="text-white text-base font-medium "
          icon={<IconMicrowave />}
          onClick={() => router.push("/equipos")}
        >
          Equipos
        </MenuItem>
        <MenuItem
          className="text-white text-base font-medium "
          icon={<IconChartBar />}
        >
          Reportes
        </MenuItem>
      </Menu>
      <Menu className="flex flex-col items-center mt-1 h-1/2 justify-end">
        <Button
          variant="bordered"
          radius="full"
          className="border border-[#F8B519] text-[#F8B519] hover:bg-[#F8B519] hover:text-[#0F0F0F]"
          startContent={<IconLogout size={24} />}
        >
          Cerrar Sesion
        </Button>
      </Menu>
    </Sidebar>
  );
}

export default Aside;
