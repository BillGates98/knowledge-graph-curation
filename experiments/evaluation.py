import time
thresholds = [0.5, 0.8]
ks = [64, 128]
axes = ['subjects', 'predicates', 'objects']
kgs = ["http://purl.agrold.org/go", "http://purl.agrold.org/po",
       "http://purl.agrold.org/so", "http://purl.agrold.org/ncbitaxon"]

URLS = "http://127.0.0.1:8000/api/-axis-/compute-similarities"

exclude_axes = ["http://purl.agrold.org/go|_128_subjects_0.5",
                "http://purl.agrold.org/go|_128_predicates_0.5", "http://purl.agrold.org/go|_128_objects_0.5"]


def get_payload(kgName, numPerm=128, threshold=0.5):
    return {
        "kgName": kgName,
        "numPerm": numPerm,
        "threshold": threshold
    }


def get_all_payloads():
    payloads = []
    for kg in kgs:
        for axis in axes:
            for k in ks:
                for threshold in thresholds:
                    if f"{kg}|_{k}_{axis}_{threshold}" in exclude_axes:
                        continue
                    payload = get_payload(kg, k, threshold)
                    payloads.append((axis, payload))
    return payloads


def run_all_payloads(client):
    payloads = get_all_payloads()
    print(f"Total payloads to process: {len(payloads)}")
    responses = []
    i = 0
    for axis, payload in payloads[43:]:
        response = client.post(URLS.replace("-axis-", axis), json=payload)
        responses.append((axis, payload, "response"))
        i += 1
        print(
            f"Processed {i}/{len(payloads)}: Axis={axis}, Payload={payload}")
        time.sleep(5)  # Add a delay between requests

    with open("responses.log", "w") as f:
        for axis, payload, response in responses:
            f.write(
                f"Axis: {axis}, Payload: {payload}\n")
    return responses


if __name__ == "__main__":
    import requests

    class Client:
        def post(self, url, json):
            return requests.post(url, json=json)
    client = Client()
    run_all_payloads(client)
