import { canCreateOrg } from "./index";
import { User } from "../prisma";

describe("'canCreate' - Checks is current user can create organizations", () => {
  const user: User = {
    email: "",
    image: "",
    name: "",
    id: "212",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    defaultOrgId: "",
    emailVerified: new Date(),
    siteRole: "ADMIN",
  };

  test("email domain should be `bigdataboutique.com`", () => {
    const valid = { ...user, email: "test@bigdataboutique.com" };
    expect(canCreateOrg(valid)).toBe(true);

    const invalid = [
      "test@1bigdataboutique.com",
      "test@bigdataboutique.ro",
      "test@bigdata-boutique.ro",
      "test@bigdata_boutique.ro",
    ];

    invalid.forEach((email) => {
      expect(canCreateOrg({ ...user, email })).toBe(false);
    });
  });
});
