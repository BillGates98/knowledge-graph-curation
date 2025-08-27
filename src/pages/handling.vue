<script setup>
import { ref } from "vue";
import { useField, useForm } from "vee-validate";
import SparqlEndpointService from "../services/sparql_endpoint.service";
import KnowledgeGraphService from "@/services/knowledge_graph.service";
import AxisService from "@/services/axis.service";
import { useRouter } from "vue-router";

/**
 * Global
 */
const router = useRouter();
const search = ref('')
const inProgress = ref(false)
const selectedAxisP = ref('subject');
const selectedKgP = ref('');

const goToConfiguration = () => {
  router.push("/");
}

const currentProcesses = ref([])
const showProcesses = ref({})

const formatProcesses = (values) => {
  for (const process of values) {
    const labelKg = dataKgs.value.find(kg => kg.id == process.knowledgeGraph)?.name || process.knowledgeGraph;
    showProcesses.value[labelKg] = {
      status: process.status,
      progress: process.progress.toFixed(2),
      createdAt: process.createdAt
    };
    if (!showProcesses.value[labelKg].axis) {
      showProcesses.value[labelKg].axis = []
    }
    showProcesses.value[labelKg].axis.push(process.axis);
  }
}

const updateStatus = (value) => {
  KnowledgeGraphService.updateComputationStatus(value).then((response) => {
    // console.log("Status updated successfully:", response.data);
  }).catch((error) => {
    console.error("Error updating status:", error);
  });
}
const currentRunning = () => {
  // console.log("Checking current running processes...");
  KnowledgeGraphService.getComputationStatus().then((response) => {
    let isRunning = false;
    // console.log("Current running processes:", response.data);
    if (response.data.length > 0 && currentProcesses.value.length > 0) {
      for (var i = 0; i < response.data.length; i++) {
        var process = response.data[i];
        var existingProcess = currentProcesses.value.find(p => p.id === process.id);
        if (existingProcess && process.progress != existingProcess.progress) {
          process.progress = process.progress % 101;
          currentProcesses.value[i] = process;
          isRunning = true;
        } else {
          // console.log("Process completed:", existingProcess);
          const toUpdate = process;
          if (existingProcess) {
            toUpdate.progress = 100;
            toUpdate.status = "COMPLETED";
            updateStatus(toUpdate);
          } else {
            currentProcesses.value.push(process);
          }
        }
        if (isRunning) {
          setTimeout(() => {
            currentRunning();
          }, 4000);
        }
      }
    } else {
      currentProcesses.value = response.data;
      currentRunning();
    }

    formatProcesses(currentProcesses.value);
  }).catch((error) => {
    console.error("Error fetching current processes:", error);
  });
}

/**
 * Endpoints Section
 */
const endpoints = ref([
  // 'http://sparql.southgreen.fr/',
  // 'https://query.wikidata.org/sparql',
  // 'https://dbpedia.org/sparql',
  // 'https://data.bioontology.org/sparql',
  // 'http://data.agrold.org/sparql',
])
const rawEndpoints = ref([])
const selectedEndpoint = ref('')
const getEndpoints = () => {
  inProgress.value = true;
  SparqlEndpointService.fetchAll()
    .then((response) => {
      endpoints.value = [];
      rawEndpoints.value = response.data;
      for (const endpoint of response.data) {
        endpoints.value.push(endpoint.uri);
      }
      listKnowledgeGraphs();
    })
    .catch((error) => {
      console.error("Error fetching endpoints:", error);
    })
    .finally(() => {
      inProgress.value = false;
    });
};

const deleteSelectedEndpoint = (value) => {
  inProgress.value = true;
  const id = rawEndpoints.value[endpoints.value.indexOf(value)].id;
  SparqlEndpointService.delete(id)
    .then(() => {
      selectedEndpoint.value = '';
      kgs.value = [];
      getEndpoints();
    })
    .catch((error) => {
      console.error("Error deleting endpoint:", error);
    })
    .finally(() => {
      inProgress.value = false;
    });
};

getEndpoints();

/**
 * Knowledge Graph Section
 */
const selectedGraphValue = ref('')
const selectedAxis = ref('')

const kgs = ref([
  // 'AGROVOC - FAO',
  // 'GEMET - EEA',
  // 'DBpedia - W3C',
  // 'Wikidata - Wikimedia',
  // 'MeSH - NLM',
  // 'GeoNames - NGA',
  // 'WordNet - Princeton',
]);
const dataKgs = ref([]);
const kgSelectedValues = ref([]);

const getKnowledgeGraphs = (sparqlEndpoint) => {
  inProgress.value = true;
  kgs.value = [];
  KnowledgeGraphService.fetchKgs(sparqlEndpoint)
    .then((response) => {
      dataKgs.value = response.data;
      for (const kg of response.data) {
        kgs.value.push(kg.name);
      }
    })
    .catch((error) => {
      console.log("Error we can't fetch the list of knowledge graphs of this endpoint");
    }).finally(() => {
      inProgress.value = false;
    });
};


const listKnowledgeGraphs = () => {
  inProgress.value = true;
  dataKgs.value = [];
  KnowledgeGraphService.listKgs()
    .then((response) => {
      dataKgs.value = response.data;
      currentRunning();
    })
    .catch((error) => {
      console.log("Error we can't fetch the list of knowledge graphs of this endpoint");
    }).finally(() => {
      inProgress.value = false;
    });
};


/**
 * Axis Section
 */
const selectedAxisValue = ref('') // subject
const dataTableItems = ref([]);



const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    minSim(value) {
      if (value && !isNaN(value) && value >= 0 && value <= 1) {
        return true;
      }
      return "Minimum Similarity needs to be a valid number.";
    },
    maxSim(value) {
      if (value && !isNaN(value) && value >= 0 && value <= 1) {
        return true;
      }
      return "Maximum Similarity needs to be a valid number.";
    },
    limit(value) {
      if (value && !isNaN(value) && value >= 1) {
        return true;
      }
      return "Limit needs to be a valid number upper or equal to 1.";
    },
    page(value) {
      if (value && !isNaN(value) && value >= 1) {
        return true;
      }
      return "Page needs to be a valid number upper or equal to 1.";
    },
  },
});

const minSim = useField("minSim", 0.9);
const maxSim = useField("maxSim", 1);
const limit = useField("limit", 100);
const page = useField("page", 1);

const totalCount = ref(0);
const totalPageCount = ref(0);
const dataTableHeaders = ref([
  { title: 'Source ID', key: selectedAxisP.value + '_id' },
  {
    title: 'Source',
    key: selectedAxisP.value + '_uri'
  },
  {
    title: 'Target',
    key: 'sim_' + selectedAxisP.value + '_uri'
  },
  {
    title: 'score',
    key: 'score'
  },
  { title: 'Target ID', key: 'sim_' + selectedAxisP.value + '_id' },
  {
    title: 'Actions',
    key: 'actions',
    align: 'end',
    sortable: false
  }])

const pushData = (data) => {
  inProgress.value = true;
  AxisService.create(data)
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
      } else {
        alert(JSON.stringify(response.data));
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err.response.data));
    }).finally(() => {
      inProgress.value = false;
    });
};
const submit = handleSubmit((values) => {
  const data = values;
  data.id = null;
  pushData(data);
});

/**
 * 
 * Actions
 */

const computeSimilarities = (axis, kg) => {
  AxisService.computeSimilarities(axis, kg).then((response) => {
    if (response.status === 200) {
      console.log("The computation has started successfully for " + axis + " axis on the knowledge graph " + kg);
    } else {
      console.log("Error we can't start the computation for " + axis + " axis on the knowledge graph " + kg);
    }
  }).catch((error) => {
    console.error("Error we can't start the computation for " + axis + " axis on the knowledge graph " + kg);
    console.error("Error starting computation:", error);
  });
};

const runWorkLoad = () => {
  // Implement the logic to run the workload
  console.log("Running workload...");
  console.log(kgSelectedValues.value);
  console.log(selectedAxis.value);
  // currentRunning();
  if (kgSelectedValues.value.length > 0 && selectedAxis.value.length > 0) {
    // continue
    for (var i = 0; i < kgSelectedValues.value.length; i++) {
      const checkStatus = currentProcesses.value.find(process => process.kg === kgSelectedValues.value[i]);
      for (var j = 0; j < selectedAxis.value.length; j++) {
        if (checkStatus && checkStatus.status !== 'in_progress' && checkStatus.axis !== selectedAxis.value[j] && selectedAxis.value[j] !== '') {
          computeSimilarities(selectedAxis.value[j], kgSelectedValues.value[i]);
        } else {
          if (!checkStatus && selectedAxis.value[j] !== '') {
            computeSimilarities(selectedAxis.value[j], kgSelectedValues.value[i]);
          } else {
            console.log("The knowledge graph " + kgSelectedValues.value[i] + " is already running");
          }
        }
      }
    }
  } else {
    if (kgSelectedValues.length === 0) {
      alert('You should select at least one knowledge graph');
    }
    if (selectedAxis.length === 0) {
      alert('You should select at least one axis');
    }
  }
  currentRunning();
};

const checkParams = () => {
  if (selectedAxisP.value !== '' && selectedKgP.value !== '') {
    if (minSim.value && maxSim.value) {
      //  && limit.value && page.value
      if (minSim.value.value > 0 && maxSim.value.value > 0) {
        if (minSim.value.value < maxSim.value.value) {
          // alert('The minimum similarity should be less than to the maximum similarity');
          if (limit.value && page.value) {
            if (limit.value.value > 0 && page.value.value > 0) {
              return true;
            }
          } else {
            limit.value.value = -1;
            page.value.value = 1;
          }
          return true;
        } else {
          // ('The minimum similarity should be less than to the maximum similarity');
          return false;
        }
      } else {
        // ('The minimum and maximum similarities should be greater than 0');
        return false;
      }
    } else {
      alert('All fields are required');
    }
    return false;
  } else {
    alert('It is imperative to select only one knowledge graph and an axis');
    return false;
  }
};

const searchSim = () => {
  let data = {}
  if (checkParams()) {
    data = {
      minScore: minSim.value.value,
      maxScore: maxSim.value.value,
      limit: limit.value.value,
      page: page.value.value,
      kgName: selectedKgP.value
    }
    console.log(selectedAxisP.value + ' ' + selectedKgP.value);
    AxisService.listSimilarities(selectedAxisP.value, data).then((response) => {
      if (response.status === 200) {
        console.log(response.data);
        dataTableItems.value = response.data[selectedAxisP.value + 's'];
        totalCount.value = response.data.total_count;
        totalPageCount.value = response.data.page_count;
        console.log(selectedAxisP.value + 's', response.data[selectedAxisP.value + 's']);
      }
    }).catch((error) => {
      console.error("Error listing similarities:", error);
    });
  } else {
    console.log('All the parameters are required');
  }
}
const produceUpdateQuery = (item) => {
  // Implement the logic to produce the update query for the selected item
};

const confirmDelete = (id) => {

};

const deleteResults = () => {
  // Implement the logic to delete the results
};

const countResults = () => {
  let data = {}
  if (checkParams()) {
    data = {
      minScore: minSim.value.value,
      maxScore: maxSim.value.value,
      limit: limit.value.value,
      page: page.value.value,
      kgName: selectedKgP.value
    }
    console.log(selectedAxisP.value + ' ' + selectedKgP.value);
    AxisService.countResults(selectedAxisP.value, data).then((response) => {
      if (response.status === 200) {
        totalCount.value = response.data.total_count;
        totalPageCount.value = response.data.page_count;
      }
    }).catch((error) => {
      console.error("Error listing similarities:", error);
    });
  } else {
    console.log('All the parameters are required');
  }
};

const correspondenceFileName = ref('');
const queriesFileName = ref('');

const generateUpdates = () => {
  let data = {}
  if (checkParams()) {
    data = {
      minScore: minSim.value.value,
      maxScore: maxSim.value.value,
      limit: limit.value.value,
      page: page.value.value,
      kgName: selectedKgP.value
    }
    console.log(selectedAxisP.value + ' ' + selectedKgP.value);
    AxisService.generateCorrespondences(selectedAxisP.value, data).then((response) => {
      if (response.status === 200) {
        correspondenceFileName.value = response.data.correspondence_file_name;
        queriesFileName.value = response.data.query_file_name;
      }
    }).catch((error) => {
      console.error("Error listing similarities:", error);
    });
  } else {
    console.log('All the parameters are required');
  }
};

const exportCorrespondences = () => {
  // window.open(AxisService.downloadFile(selectedAxisP.value, { filePath: correspondenceFileName.value }), '_blank');
  window.open(AxisService.downloadFile(selectedAxisP.value, { filePath: queriesFileName.value }), '_blank');
};

</script>
<template>
  <v-card class="mx-auto">
    <v-layout>
      <v-app-bar color="success" density="compact" class="pa-2">
        <template v-slot:prepend>
          <v-app-bar-nav-icon icon="mdi-chess-rook"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title class="text-h5">Dataset curation</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-row class="align-justify">
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-icon icon="mdi-delete" size="30" color="error" style="margin-top: 20px" v-tooltip="'Delete an endpoint'"
              @click="deleteSelectedEndpoint(selectedEndpoint)"></v-icon>
          </v-col>
          <v-col cols="12" md="6">
            <v-select v-model="selectedEndpoint" :items="endpoints" label="Select an endpoint"
              style="height: 56px;"></v-select>
          </v-col>
          <v-col cols="12" md="4" class="d-flex">
            <v-btn color="primary" style="height: 56px; margin-top: 10px"
              v-tooltip="'Load knowledge graphs of the selected sparql endpoint'"
              @click="getKnowledgeGraphs(selectedEndpoint)">Connect</v-btn>
            <v-icon icon="mdi-cog" size="30" color="white" style="margin-left: 10px; margin-top: 20px"
              v-tooltip="'Go back to configuration add endpoint'" @click="goToConfiguration"></v-icon>
          </v-col>
        </v-row>
      </v-app-bar>

      <v-main style="margin-top: 24px; height: calc(100vh - 105px)">
        <v-container fluid>
          <v-row class="text-center">
            <v-col cols="12" md="12" class="d-flex justify-center" v-if="inProgress">
              <v-progress-circular color="primary" indeterminate></v-progress-circular>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" md="2">
              <v-row>
                <v-col cols="12">
                  <v-card class="mx-auto" prepend-icon="mdi-spider-thread" subtitle="Status of Work on KGs">
                    <template v-slot:title>
                      <span class="font-weight-black">Running Workload</span>
                    </template>
                    <v-row class="pa-4" style="max-height: calc(100vh - 200px); width:100%; overflow-y: auto;">
                      <v-col cols="12" v-for="(value, index) in showProcesses" :key="index"
                        style="overflow-x:auto;background-color: black; margin-bottom: 10px; border-radius: 10px; padding: 10px;">
                        <v-progress-circular v-if="value.status === 'in_progress'" size="16" color="amber"
                          indeterminate></v-progress-circular><v-icon icon="mdi-check-all"
                          v-if="value.status === 'COMPLETED'" size="16" color="success"></v-icon> <strong>{{ index
                          }}</strong> <br />{{
                            value.axis.join(',') }} / {{ value.status }} / {{ value.progress }}%
                        <br />
                        <v-progress-linear color="light-blue" height="10" :model-value="value.progress"
                          striped></v-progress-linear>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="8">
              <v-row>
                <v-col cols="12" md="7">
                  <v-label style="font-size: 1.2em;">Select a Knowledge Graph</v-label>
                  <v-select v-model="kgSelectedValues" :items="kgs" label="Knowledge Graphs" multiple chips
                    deletable-chips hint="Select one or more knowledge graphs to use in the curation process."
                    persistent-hint />
                </v-col>
                <v-col cols="12" md="3">
                  <v-label style="font-size: 1.2em;margin-top: 1px">Select an axis</v-label>
                  <v-select v-model="selectedAxis" :items="['subject', 'predicate', 'object']" multiple label="Axis" />
                </v-col>
                <v-col cols="12" md="2" class="text-end">
                  <v-btn color="primary" style="height: 56px; margin-top: 30px" @click="runWorkLoad">Run
                    Workload</v-btn>
                </v-col>
              </v-row>
              <v-row>
                <v-card flat style="width: 100%;">
                  <v-card-title class="d-flex align-center pe-2">
                    <v-icon icon="mdi-video-input-component"></v-icon> &nbsp;
                    # Find by all by default (total w/o limit : {{ totalCount }} and total pages : {{ totalPageCount }})

                    <v-spacer></v-spacer>

                    <v-text-field v-model="search" density="compact" label="Search" prepend-inner-icon="mdi-magnify"
                      variant="solo-filled" flat hide-details single-line></v-text-field>
                  </v-card-title>

                  <v-divider></v-divider>
                  <v-data-table v-model:search="search"
                    :filter-keys="[selectedAxisP.value + 'uri', 'sim_' + selectedAxisP.value + '_uri', 'score']"
                    :items="dataTableItems" :headers="dataTableHeaders" fixed-header height="calc(100vh - 400px)">

                    <template v-slot:item.actions="{ item }">
                      <div class="d-flex ga-2 justify-end">
                        <v-icon color="blue-darken-2" icon="mdi-list-box" size="large" @click="produceUpdateQuery(item)"
                          v-tooltip="'Show similar'"></v-icon>
                        <v-icon color="red-lighten-2" icon="mdi-delete" size="large" @click="confirmDelete(item.id)"
                          v-tooltip="'Delete'"></v-icon>
                      </div>

                    </template>
                  </v-data-table>
                </v-card>
              </v-row>
            </v-col>

            <v-col cols="12" md="2">
              <v-card class="pa-4" style="height: calc(100vh - 150px);overflow-y: auto;">
                <v-card-title style="font-size: 2em;">Parameters</v-card-title>
                <form @submit.prevent="">
                  <v-row>
                    <v-col cols="12">
                      <v-select v-model="selectedKgP" :items="kgs" label="Knowledge Graphs"
                        hint="Select one knowledge graph." persistent-hint />
                    </v-col>
                    <v-col cols="12">
                      <v-select v-model="selectedAxisP" :items="['subject', 'predicate', 'object']" label="Axis"
                        persistent-hint />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field type="number" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-numeric-0" hint="The minimum value." persistent-hint
                        v-model="minSim.value.value" :error-messages="minSim.errorMessage.value"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field type="number" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-numeric-1" hint="The maximum value." persistent-hint
                        v-model="maxSim.value.value" :error-messages="maxSim.errorMessage.value"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field type="number" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-page-layout-body" hint="The page number." persistent-hint
                        v-model="page.value.value" :error-messages="page.errorMessage.value"></v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field type="number" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-format-list-numbered" hint="The limit of results." persistent-hint
                        v-model="limit.value.value" :error-messages="limit.errorMessage.value"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-btn color="primary" style="width: 100%;" @click="searchSim"> Search </v-btn>
                    </v-col>
                    <v-col cols="12" class="d-flex justify-end">
                      <v-btn color="white" style="width: 100%;" @click="countResults">
                        Count Results
                      </v-btn>
                    </v-col>
                    <v-col cols="12" class="d-flex justify-end">
                      <v-btn color="warning" style="width: 100%;" @click="generateUpdates">
                        Generate updates
                      </v-btn>
                    </v-col>
                    <v-col cols="12" class="d-flex justify-end"
                      v-if="correspondenceFileName !== '' && queriesFileName !== ''">
                      <v-btn color="white" style="width: 100%;" @click="exportCorrespondences">
                        Export correspondences
                      </v-btn>
                    </v-col>
                    <v-col cols="12" class="d-flex justify-end">
                      <v-btn color="error" style="width: 100%;" @click="deleteResults">
                        Delete results
                      </v-btn>
                    </v-col>
                  </v-row>
                </form>
              </v-card>

            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>
