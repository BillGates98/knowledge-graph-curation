<script lang="ts" setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import ConfigurationService from "../services/configuration.service";
import { useRouter } from "vue-router";

/**
 *
 *
 *
 http://sparql.southgreen.fr/?default-graph-uri=&query=select+distinct+%3FConcept+where+%7B%5B%5D+a+%3FConcept%7D+LIMIT+100&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on&run=+Run+Query+
 */

function isValidURL(value) {
  var res = value.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
}

const router = useRouter();
const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    sparqlEndpoint(value) {
      if (value && isValidURL(value)) {
        return true;
      }
      return "SPARQL Endpoint needs to be a valid URL.";
    },
    queryParams(value) {
      if (value?.length >= 2) return true;

      return "Query Parameters needs to be at least 2 characters.";
    },
  },
});

const sparqlEndpoint = useField("sparqlEndpoint");
const queryParams = useField("queryParams");
const username = useField("username");
const password = useField("password");

const pushData = (data) => {
  const code = { code: new Date().getTime().toString() };
  router.push("/handling?" + new URLSearchParams(code).toString());
  ConfigurationService.create(data)
    .then((response) => {
      console.log(response);
      if (response.status === 201) {
        alert("Created successfully");
        handleReset();
      } else {
        alert(JSON.stringify(response.data));
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err.response.data));
    });
};
const submit = handleSubmit((values) => {
  const data = values;
  data.id = null;
  pushData(data);
});
</script>
<template>
  <v-card class="mx-auto">
    <v-layout>
      <v-app-bar color="primary" density="compact" class="pa-8">
        <template v-slot:prepend>
          <v-app-bar-nav-icon icon="mdi-cogs"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title class="text-h5">Configurations</v-app-bar-title>
      </v-app-bar>

      <v-main style="margin-top: 64px; height: calc(100vh - 105px)">
        <v-container fluid>
          <v-row dense>
            <v-col cols="12" md="3"> </v-col>

            <v-col cols="12" md="6">
              <v-card class="pa-4">
                <form @submit.prevent="submit">
                  <v-textarea
                    type="url"
                    label="SPARQL Endpoint"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-database"
                    hint="The SPARQL endpoint URL."
                    persistent-hint
                    v-model="sparqlEndpoint.value.value"
                    :error-messages="sparqlEndpoint.errorMessage.value"
                  ></v-textarea>
                  <div class="pa-4"></div>
                  <v-text-field
                    label="SPARQL query parameter identifier"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-code-tags"
                    hint="The value that helps to identify the query section to replace in the SPARQL endpoint URL."
                    persistent-hint
                    v-model="queryParams.value.value"
                    :error-messages="queryParams.errorMessage.value"
                  ></v-text-field>
                  <div class="pa-4"></div>
                  <v-text-field
                    label="Username"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account"
                    hint="The username for authentication."
                    persistent-hint
                    v-model="username.value.value"
                    :error-messages="username.errorMessage.value"
                  ></v-text-field>
                  <div class="pa-4"></div>
                  <v-text-field
                    label="Password"
                    type="password"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-lock"
                    hint="The password for authentication."
                    persistent-hint
                    v-model="password.value.value"
                    :error-messages="password.errorMessage.value"
                  ></v-text-field>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-btn color="primary" class="mt-4" type="submit"> Save </v-btn>
                    </v-col>
                    <v-col cols="12" md="6" class="d-flex justify-end">
                      <v-btn color="white" class="mt-4" @click="handleReset">
                        Clear
                      </v-btn>
                    </v-col>
                  </v-row>
                </form>
              </v-card>
            </v-col>

            <v-col cols="12" md="3"> </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>
