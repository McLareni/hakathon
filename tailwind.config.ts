import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      boxShadow: {
        soft: `
          0px 1px 3px 0px rgba(117, 117, 117, 0.1),
          0px 5px 5px 0px rgba(117, 117, 117, 0.09),
          0px 10px 6px 0px rgba(117, 117, 117, 0.05),
          0px 19px 7px 0px rgba(117, 117, 117, 0.01),
          0px 29px 8px 0px rgba(117, 117, 117, 0)
        `,
        redSoft: `  
                    0px 29px 8px 0px rgba(220, 20, 60, 0),
                    0px 19px 7px 0px rgba(220, 20, 60, 0.1),
                    0px 10px 6px 0px rgba(220, 20, 60, 0.15),
                    0px 5px 5px 0px rgba(220, 20, 60, 0.2),
                    0px 1px 3px 0px rgba(220, 20, 60, 0.25)


            `,
      },
    },
  },
};

export default config;
