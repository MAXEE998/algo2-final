public class Tests {

	public static void test1(int n) {
		Integer[] keys = new Integer[n];
		String[] vals = new String[n];

		for (int i = 0; i < n; i++) {
			int key = (int) (1000000 * Math.random());
			keys[i] = key;
			vals[i] = "TEST#" + key;
		}

		long startTime = System.currentTimeMillis();
		SkipListSeqC<Integer, String> seqSL = new SkipListSeqC<>(keys, vals);
		long endTime = System.currentTimeMillis();
		System.out.println("Seq Initialization Took: " + (endTime - startTime));
		startTime = System.currentTimeMillis();
		SkipListLinkedC<Integer, String> linkedSl = new SkipListLinkedC<>(keys, vals);
		endTime = System.currentTimeMillis();
		System.out.println("Linked Initialization Took: " + (endTime - startTime));
	}

//	private long time(SkipList sl) {
//		long startTime = System.currentTimeMillis();
//		long endTime = System.currentTimeMillis();
//	}


	public static void main(String[] args) {
		System.out.println("Skip List Test#1: Insertion Tests Comparison\n");
		test1(10000);// 1 million elements
	}
}
