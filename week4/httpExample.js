const { app } = require("@azure/functions");

let personenLijst = [
  { id: 1, voornaam: "Aashish", achternaam: "Swami" },
  { id: 2, voornaam: "Jane", achternaam: "Doe" },
];

app.http("opdr2", {
  methods: ["GET"],
  authLevel: "function",
  handler: async (request, context) => {
    context.log(`Alle personen worden opgevraagd"`);
    return { status: 200, jsonBody: personenLijst };
  },
});

app.http("opdr2Persoon", {
  methods: ["GET", "PUT", "DELETE"],
  authLevel: "function",
  route: "personen/{id:int}",
  handler: async (request, context) => {
    const id = parseInt(request.params.id);
    const index = personenLijst.findIndex((p) => id === p.id);
    if (index === -1) {
      return { status: 404, body: "Geen persoon met die ID" };
    }
    switch (request.method) {
      case "GET": {
        return { status: 200, jsonBody: personenLijst[index] };
      }
      case "PUT": {
        const body = await request.json();
        if (!(body.voornaam && body.achternaam)) {
          return {
            status: 400,
            body: "Voor- en achternaam benodigd om een ID zijn waarde te veranderen",
          };
        }
        personenLijst[index] = {
          id,
          voornaam: body.voornaam.trim(),
          achternaam: body.achternaam.trim(),
        };
        return { status: 200, jsonBody: personenLijst[index] };
      }
      case "DELETE": {
        personenLijst.splice(index);
        context.log(`Persoon ${id} verwijderd`);
        return { status: 204 };
      }
    }
  },
});

app.http("opdr2PersoonToevoegen", {
  methods: ["POST"],
  authLevel: "function",
  route: "personen",
  handler: async (request, context) => {
    const body = await request.json();
    if (!(body.voornaam && body.achternaam)) {
      return {
        status: 400,
        body: "Voor- en achternaam benodigd om persoon toe te voegen",
      };
    }
    let currentID = personenLijst.length;
    currentID++;
    const nieuwPersoon = {
      id: currentID,
      voornaam: body.voornaam.trim(),
      achternaam: body.achternaam.trim(),
    };
    const url = new URL(request.url);
    personenLijst.push(nieuwPersoon);
    return {
      status: 201,
      headers: { Location: `${url.origin}/api/personen/${nieuwPersoon.id}` },
      jsonBody: nieuwPersoon,
    };
  },
});
