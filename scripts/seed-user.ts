import { db } from "../src/lib/db";
import { passwordHash } from "../src/lib/security";

async function main() {
  const email = "test@gmail.com";
  const password = "Start123!!!";
  const name = "Admin";
  const workspaceName = "Mein Workspace";

  console.log(`Checking user ${email}...`);
  const existingUser = await db.user.findUnique({
    where: { email },
    include: { memberships: true },
  });

  const hash = passwordHash(password);

  if (existingUser) {
    console.log("User exists, updating password...");
    await db.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: hash },
    });
    console.log("Password updated successfully!");

    if (existingUser.memberships.length === 0) {
      console.log("Creating default workspace for user...");
      const workspace = await db.workspace.create({
        data: {
          name: workspaceName,
          members: {
            create: {
              userId: existingUser.id,
              role: "OWNER",
            },
          },
        },
      });
      console.log(`Created workspace ${workspace.id}`);
    }
  } else {
    console.log("Creating new user...");
    const workspace = await db.workspace.create({
      data: { name: workspaceName },
    });

    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hash,
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: "OWNER",
          },
        },
      },
    });
    console.log(`User created: ${user.id} with workspace: ${workspace.id}`);
  }
}

main()
  .then(() => {
    console.log("DONE");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error seeding user:", err);
    process.exit(1);
  });
